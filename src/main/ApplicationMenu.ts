import { Vue } from 'vue-property-decorator';
import { app, Menu, MenuItemConstructorOptions, MenuItem, BrowserWindow } from 'electron';
import { isDevelopment } from '@/shared/Utils';
import Broadcasters from '@/shared/audio/Broadcasters';
import * as MenuEvents from '@/shared/constants/MenuEvents';

const FILE_MENU_TEMPLATE = {
    role: 'fileMenu',
    submenu: [
        { role: 'quit' }
    ]
};

const EDIT_MENU_TEMPLATE = {
    role: 'editMenu',
    submenu: [
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
    ]
};

const VIEW_MENU_TEMPLATE = {
    role: 'viewMenu',
    submenu: [
        { role: 'reload', },
        { role: 'togglefullscreen' },
        { type: 'separator', },
        {
            id: MenuEvents.EVENT_PREVIOUS_PAGE,
            label: 'Previous Page',
            accelerator: 'CmdOrCtrl+[',
        },
        {
            id: MenuEvents.EVENT_NEXT_PAGE,
            label: 'Next Page',
            accelerator: 'CmdOrCtrl+]',
        },
    ],
};

const PLAYBACK_MENU_TEMPLATE = {
    label: 'Playback',
    submenu: [
        {
            id: MenuEvents.EVENT_PLAY_PAUSE,
            label: 'Play / Pause',
        },
        {
            id: MenuEvents.EVENT_PREVIOUS_TRACK,
            label: 'Previous Track',
        },
        {
            id: MenuEvents.EVENT_NEXT_TRACK,
            label: 'Next Track',
        }
    ]
};

const WINDOW_MENU_TEMPLATE = {
    label: 'Window',
    role: 'windowMenu',
    submenu: [
        { role: 'minimize', },
        { type: 'separator', },
        {
            id: MenuEvents.EVENT_MINI_PLAYER_TOGGLE,
            label: 'Toggle Mini Player',
            type: 'checkbox',
            checked: false,
            accelerator: 'CmdOrCtrl+Shift+M',
        },
        { type: 'separator' },
        {
            role: 'toggledevtools',
            visibilityTest: () => isDevelopment
        },
        {
            id: MenuEvents.EVENT_PLAYER_DEV_TOOLS,
            label: 'Toggle Devtools for Player',
            visibilityTest: () => isDevelopment
        },
        { role: 'close', },
    ],
};

const HELP_MENU_TEMPLATE = {
    role: 'help',
    submenu: [
        { 
            id: MenuEvents.EVENT_ABOUT,
            label: 'About',
        },
    ],
};

const DARWIN_MENU_TEMPLATE = {
    label: app.name,
    submenu: [
        { role: 'about' },
        {
            id: MenuEvents.EVENT_PREFERENCES,
            label: 'Preferences',
            accelerator: 'Command+,',
        },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers', },
        { role: 'unhide', },
        { type: 'separator', },
        { role: 'quit' },
    ],
};

class MenuEventHandler {
    constructor(private emitter: Vue, private menuItem: MenuItem) {}

    public emitEvent(): void {
        this.emitter.$emit(MenuEvents.EVENT_MENU_EVENT, this.menuItem);
    }
}

export default class ApplicationMenu {
    constructor(private menuEventsEmitter: Vue) {}

    /**
     * Configure the application menu.
     */
    public configureApplicationMenu(): void {
        const menu = Menu.buildFromTemplate([
            FILE_MENU_TEMPLATE as MenuItemConstructorOptions,
            EDIT_MENU_TEMPLATE as MenuItemConstructorOptions,
            this.createBroadcastersMenuTemplate(),
            PLAYBACK_MENU_TEMPLATE as MenuItemConstructorOptions,
            VIEW_MENU_TEMPLATE as MenuItemConstructorOptions,
            WINDOW_MENU_TEMPLATE as MenuItemConstructorOptions,
            HELP_MENU_TEMPLATE as MenuItemConstructorOptions]);
        this.configureMenuItems(menu);
        Menu.setApplicationMenu(menu);

        if (process.platform === 'darwin') {
            // Add Playback menu options to Dock menu
            app.dock.setMenu(Menu.buildFromTemplate([ DARWIN_MENU_TEMPLATE as MenuItemConstructorOptions ]));
        }
    }

    /**
     * Configure visibiilty and click handlers for the specified
     * Menu (recursively)
     * 
     * @param menu 
     */
    private configureMenuItems(menu: Menu): void {
        menu.items.forEach((item) => {
            const itemAny = item as any;
            if (itemAny.visibilityTest) {
                item.visible = itemAny.visibilityTest();
            }  
            
            if (item.id && item.id.startsWith('event-')) {
                const handler = new MenuEventHandler(this.menuEventsEmitter, item);
                item.click = handler.emitEvent.bind(handler);
            }

            if (item.submenu) {
                this.configureMenuItems(item.submenu);
            }
        });
    }

    /**
     * Create the broadcasters menu template
     */
    private createBroadcastersMenuTemplate(): MenuItemConstructorOptions {
        const broadcasterItems = Broadcasters.map((player) => {
            return {
                label: player.name,
                click: () => { this.menuEventsEmitter.$emit(MenuEvents.EVENT_PLAYER_SELECT, player.id); }
            };
        }) as any;

        return {
            label: 'Broadcaster',
            submenu: broadcasterItems
        };
    }
}
