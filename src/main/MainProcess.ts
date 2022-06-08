import {
    app,
    BrowserWindow,
    BrowserWindowConstructorOptions,
    dialog,
    globalShortcut,
    ipcMain,
    MenuItem,
    Rectangle,
    systemPreferences } from 'electron';
import { Vue } from 'vue-property-decorator';
import { DEFAULT_FULL_PLAYER_BOUNDS, DEFAULT_MINI_PLAYER_BOUNDS } from '@/shared/constants/PlayerBounds';
import ApplicationMenu from './ApplicationMenu';
import Broadcaster from '@/shared/audio/Broadcaster';
import Broadcasters, { broadcasterWithId } from '@/shared/audio/Broadcasters';
import BroadcasterPlayerState from '@/shared/audio/BroadcasterPlayerState';
import debounce from 'debounce';
import MediaKeys from '@/shared/constants/MediaKeys';
import path from 'path';
import Store from 'electron-store';
import * as IpcCommands from '@/shared/constants/IpcCommands';
import * as LinuxPlatformSupport from '@/platform-support/LinuxPlatformSupport';
import * as MenuEvents from '@/shared/constants/MenuEvents';
import * as winston from 'winston';

const LAST_BROADCASTER = 'lastBroadcaster';

/**
 * The processing functionality for the main Electron thread
 */
export default class MainProcess {
    private store: Store<any>;
    private applicationMenu: ApplicationMenu;

    private miniMode = false;

    private fullPlayerWindow: BrowserWindow;
    private miniPlayerWindow: BrowserWindow;

    private broadcaster?: Broadcaster;
    private broadcastState?: BroadcasterPlayerState;

    constructor(private logger: winston.Logger) {
        this.store = new Store();
        app.on("activate", () => this.onActivate());
        ipcMain.on(IpcCommands.LOG_MESSAGE, (event: any, args: any) => this.onIpcLogMessage(args));

        // The initial player to be shown
        const broadcasterId = this.store.get(LAST_BROADCASTER) || Broadcasters[0].id;
        this.broadcaster = broadcasterWithId(broadcasterId);

        // Create the application menu
        const menuEvents = new Vue();
        this.applicationMenu = new ApplicationMenu(menuEvents);
        this.applicationMenu.configureApplicationMenu();

        // Wire up menu event listeners
        menuEvents.$on(MenuEvents.EVENT_MENU_EVENT, (menuItem: MenuItem) => this.onMenuItemSelect(menuItem));
        menuEvents.$on(MenuEvents.EVENT_PLAYER_SELECT, (broadcasterId: string) => this.onBroadcasterSelect(broadcasterId));

        // Create the full and mini player windows
        this.fullPlayerWindow = this.createFullPlayerWindow();
        this.miniPlayerWindow = this.createMiniPlayerWindow();

        // Wire up renderer IPC listeners
        ipcMain.on(IpcCommands.MEDIA_CONTROL, (event: any, details: string) => this.onMediaKey(details));
        ipcMain.on(IpcCommands.PLAYER_STATUS_UPDATE, (event: any, state: BroadcasterPlayerState) => this.onPlayerStateUpdate(state));
        ipcMain.on(IpcCommands.GET_CURRENT_BROADCASTER, (event: any, args: any) => {
            this.logger.debug("Received GET_CURRENT_BROADCASTER request from renderer");
            event.returnValue = this.broadcaster ? this.broadcaster.id : '';
        });
    }

    /**
     * Open the windows.
     */
    openWindows(): void {
        // Pick the appropriate URL for the Renderer process
        const rendererURL = this.getRendererURL('/mini-player');

        // Open and place the windows in the appropriate order
        this.logger.debug('Loading broadcaster URL: %s', this.broadcaster!.url);
        this.fullPlayerWindow!.webContents.loadURL(this.broadcaster!.url)
            .then(() => {
                this.logger.debug('Loaded braodcaster URL.  Loading renderer: %s', rendererURL);
                return this.miniPlayerWindow.loadURL(rendererURL)
            })
            .then(() => {
                this.logger.debug('Windows loaded.');

                // Register listeners for global media keys
                this.promptForAccessibility();
                try {
                    this.registerMediaKeyHandlers();
                } catch (e) {
                    this.logger.error("Unable to register media key handlers: %s", e);
                }
            });
    }

    ///////////////////////////////////////////////
    // Window bounds management
    ///////////////////////////////////////////////

    /**
     * Return the key to be used for bounds storage.
     */
    private getBoundsStorageKey(mini: boolean): string {
        const id =  mini ? '_mini_mode' : this.broadcaster!.id;
        return `${id}.bounds`;
    }

    /**
     * Return the bounds stored for the broadcaster.
     */
    private getStoredBroadcasterBounds(mini: boolean): Rectangle {
        const bounds = this.store.get(this.getBoundsStorageKey(mini)) ||
            (mini ? DEFAULT_MINI_PLAYER_BOUNDS : DEFAULT_FULL_PLAYER_BOUNDS);
        this.logger.debug('Returning bounds %o for %s', bounds, this.getBoundsStorageKey(mini));
        return bounds;
    }

    /**
     * Update the bounds being stored for the primary window.
     */
    private updateStoredBroadcasterBounds(mini: boolean): void {
        const storageKey = this.getBoundsStorageKey(mini);
        const bounds = mini ? this.miniPlayerWindow.getContentBounds() : this.fullPlayerWindow.getContentBounds();

        this.logger.debug('Storing bounds %o for %s', bounds, storageKey);
        this.store.set(storageKey, bounds);
    }

    ///////////////////////////////////////////////
    // Event handlers
    ///////////////////////////////////////////////

    /**
     * Handle the about menu item
     */
    private onAboutMenu(): void {
        const window = new BrowserWindow({
            height: 400,
            width: 500,
            center: true,
            fullscreenable: false,
            minimizable: false,
            maximizable: false,
            resizable: false,
            modal: true,

            icon: path.join(__static, 'icon.png'),
            show: true,
            parent: this.miniMode ? this.miniPlayerWindow : this.fullPlayerWindow,

            webPreferences: {
                backgroundThrottling: false,
                contextIsolation: false,
                nodeIntegration: true,
                plugins: false,
            }
        });

        window.setMenu(null);
        window.loadURL(this.getRendererURL('about'));
    }

    /**
     * Handle activation event
     */
    private onActivate(): void {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (this.miniMode) {
            this.miniPlayerWindow.show();
        } else {
            this.fullPlayerWindow.show();
        }
    }

    /**
     * Handle a logged message from an IPC.
     *
     * @param info the log info object
     */
    private onIpcLogMessage(info: any): void {
        const level = info.level || 'info';
        const message = info.message || 'No message';

        this.logger.log(level, message, info);
    }

    /**
     * Handle a media key being pressed
     *
     * @param key
     */
    private onMediaKey(key: string): void {
        this.logger.debug("Media key: %s", key);
        this.fullPlayerWindow.webContents.send(IpcCommands.MEDIA_CONTROL, key);
    }

    /**
     * Handle a menu item being selected.
     *
     * @param menuItem
     */
    private onMenuItemSelect(menuItem: MenuItem): void {
        switch (menuItem.id) {
            case MenuEvents.EVENT_ABOUT:
                this.onAboutMenu();
                break;

            case MenuEvents.EVENT_MINI_PLAYER_TOGGLE:
                this.onToggleMiniPlayer(menuItem);
                break;

            case MenuEvents.EVENT_NEXT_PAGE:
                if (this.fullPlayerWindow.webContents.canGoForward()) {
                    this.fullPlayerWindow.webContents.goForward();
                }
                break;

            case MenuEvents.EVENT_NEXT_TRACK:
                this.onMediaKey(MediaKeys.MEDIA_NEXT_TRACK);
                break;

            case MenuEvents.EVENT_PLAY_PAUSE:
                this.onMediaKey(MediaKeys.MEDIA_PLAY_PAUSE);
                break;

            case MenuEvents.EVENT_PREFERENCES:
                this.logger.info('Preferences menu selected');
                break;

            case MenuEvents.EVENT_PREVIOUS_PAGE:
                if (this.fullPlayerWindow.webContents.canGoBack()) {
                    this.fullPlayerWindow.webContents.goBack();
                }
                break;

            case MenuEvents.EVENT_PREVIOUS_TRACK:
                this.onMediaKey(MediaKeys.MEDIA_PREVIOUS_TRACK);
                break;
        }
    }

    /**
     * Returns a Promise that will resolve when the specified
     * message is received.
     *
     * @param message
     */
    private onMessageReceived(message: string): Promise<any[]> {
        return new Promise(function(resolve, reject) {
            ipcMain.once(message, (event: any, args: any[]) => {
                resolve(args);
            });
        });
    }

    /**
     * Handle a broadcaster id menu item being selected.
     *
     * @param broadcasterId
     */
    private onBroadcasterSelect(broadcasterId: string): void {
        this.logger.debug('Broadcaster select: %s', broadcasterId);
        this.broadcaster = broadcasterWithId(broadcasterId);
        if (this.broadcaster) {
            this.store.set(LAST_BROADCASTER, broadcasterId);

            this.logger.debug('Full player update player: %s', broadcasterId);
            this.fullPlayerWindow.webContents.send(IpcCommands.SHUTDOWN_INTEROP, broadcasterId);

            this.onMessageReceived(IpcCommands.INTEROP_SHUTDOWN_COMPLETE)
                .then((args: any[]) => {
                    this.logger.debug('Shutdown complete.  Loading broadcaster URL: %s', this.broadcaster!.url);
                    this.broadcaster!.configure(this.fullPlayerWindow);
                    return this.fullPlayerWindow.webContents.loadURL(this.broadcaster!.url)
                })
                .then(() => {
                    this.logger.debug("Broadcaster URL loaded");
                    this.miniPlayerWindow.webContents.send(IpcCommands.SET_BROADCASTER, broadcasterId);
                });
        }
    }

    /**
     * Update player state sent from the preload integration.
     *
     * @param state
     */
    private onPlayerStateUpdate(state: BroadcasterPlayerState): void {
        this.broadcastState = state;
        this.miniPlayerWindow.webContents.send(IpcCommands.PLAYER_STATUS_UPDATE, state);
    }

    /**
     * Handle toggling to/from mini player.
     *
     * @param menuItem
     */
    private onToggleMiniPlayer(menuItem: MenuItem): void {
        this.miniMode = !menuItem.checked;
        menuItem.checked = this.miniMode;

        if (this.miniMode) {
            this.miniPlayerWindow!.show();
            this.fullPlayerWindow!.hide();
        } else {
            this.miniPlayerWindow!.hide();
            this.fullPlayerWindow!.show();
        }
    }

    ///////////////////////////////////////////////
    // Window Management
    ///////////////////////////////////////////////

    /**
     * Create the BrowserWindow for the full size player.
     */
    private createFullPlayerWindow(): BrowserWindow {
        const bounds = this.getStoredBroadcasterBounds(false);
        const options = Object.assign({
            icon: path.join(__static, 'icon.png'),
            useContentSize: true,
            webPreferences: {
                backgroundThrottling: false,
                contextIsolation: false,
                enableRemoteModule: true,
                nodeIntegration: true,
                plugins: true,
                preload: path.join(__static, 'js/preload.js')
            }
        }, bounds) as BrowserWindowConstructorOptions;

        const window = new BrowserWindow(options);
        window.on("closed", () => { this.logger.info("Full player closed") });
        window.on('moved', debounce(() => { this.updateStoredBroadcasterBounds(false) }));
        window.on('resize', debounce(() => { this.updateStoredBroadcasterBounds(false) }));

        return window;
    }

    /**
     * Create the BrowserWindow for the mini size player.
     */
    private createMiniPlayerWindow(): BrowserWindow {
        const bounds = this.getStoredBroadcasterBounds(true);
        const options = Object.assign({
            icon: path.join(__static, 'icon.png'),
            resizable: false,
            show: false,
            useContentSize: true,
            webPreferences: {
                backgroundThrottling: false,
                contextIsolation: false,
                nodeIntegration: true,
                plugins: false,
            }
        }, bounds) as BrowserWindowConstructorOptions;

        const window = new BrowserWindow(options);
        /* this.fullPlayerWindow = undefined; */
        window.on("closed", () => { this.logger.info("Mini player closed") });
        window.on('moved', debounce(() => { this.updateStoredBroadcasterBounds(true) }));
        window.on('resize', debounce(() => { this.updateStoredBroadcasterBounds(true) }));

        return window;
    }

    ///////////////////////////////////////////////
    // Media Key Registration
    ///////////////////////////////////////////////

    /**
     * Check accessibility on MacOS and prompt the user to be prompted to enable
     * accessibility in system preferences.
     */
    private promptForAccessibility(): void {
        if (process.platform == 'darwin') {
            const isTrusted = systemPreferences.isTrustedAccessibilityClient(false)
            if (!isTrusted) {
                dialog.showMessageBox({
                    type: 'warning',
                    message: 'Turn on accessibility',
                    detail:
                        'To control playback in Maestro using media keys on your keyboard, ' +
                        'select the Maestro checkbox in Security & Privacy > Accessibility.' +
                        '\n\nYou will have to restart Maestro after enabling access.',
                    defaultId: 1,
                    cancelId: 0,
                    buttons: ['Not Now', 'Turn On Accessibility']
                })
                .then((msgBoxResponse) => {
                    if (msgBoxResponse.response === 1) {
                        //
                        // Calling isTrustedAccessibilityClient with prompt=true has the side effect
                        // of showing the native dialog that either denies access or opens System
                        // Preferences.
                        //
                        // Note: the dialog does not block this call, the changes are only
                        // effective after restarting Maestro.
                        //
                        systemPreferences.isTrustedAccessibilityClient(true)
                    };
                });
            }
        }
    }

    /**
     * Register a handler callback function for the specified key.
     *
     * @param key
     * @param callback
     */
    private registerMediaKeyHandler(key: MediaKeys, callback: () => void) {
        if (!globalShortcut.register(key, callback)) {
            const message = `Failed to register global shortcut key ${key}`;
            this.logger.error(message);
            throw new Error(message)
        }
    }

    /**
     * Register handler functions for  the global media keys
     */
    private registerMediaKeyHandlers(): void {
        this.registerMediaKeyHandler(MediaKeys.MEDIA_NEXT_TRACK, () => this.onMediaKey(MediaKeys.MEDIA_NEXT_TRACK));
        this.registerMediaKeyHandler(MediaKeys.MEDIA_PLAY_PAUSE, () => this.onMediaKey(MediaKeys.MEDIA_PLAY_PAUSE));
        this.registerMediaKeyHandler(MediaKeys.MEDIA_STOP, () => this.onMediaKey(MediaKeys.MEDIA_STOP));
        this.registerMediaKeyHandler(MediaKeys.MEDIA_PREVIOUS_TRACK, () => this.onMediaKey(MediaKeys.MEDIA_PREVIOUS_TRACK));

        if (process.platform == 'linux') {
            LinuxPlatformSupport.registerLinuxMediaKeyHandlers(this.logger, this.onMediaKey.bind(this));
        }
    }

    ///////////////////////////////////////////////
    // Miscellaneous
    ///////////////////////////////////////////////

    /**
     * Return the renderer URL for the specified route.
     *
     * @param route
     */
    private getRendererURL(route: string): string {
        // Pick the appropriate URL for the Renderer process
        const baseRendererURL = process.env.WEBPACK_DEV_SERVER_URL ?
            process.env.WEBPACK_DEV_SERVER_URL as string :  // Load the url of the dev server if in development mode
            "app://./index.html";                           // Load the index.html when not in development

        return `${baseRendererURL}#${route}`;
    }
}
