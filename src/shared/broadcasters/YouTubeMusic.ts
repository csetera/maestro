import Broadcaster from '@/shared/audio/Broadcaster';
import BroadcasterPlayerState from '@/shared/audio/BroadcasterPlayerState';
import AbstractBroadcaster from '@/shared/audio/AbstractBroadcaster';
import { hasValue } from '@/shared/Utils';
import { DEFAULT_MINI_PLAYER_BOUNDS } from '@/shared/constants/PlayerBounds';
import { OnBeforeSendHeadersListenerDetails } from 'electron';

const PREV_TRACK_SELECTOR = '#left-controls > div > paper-icon-button.previous-button.style-scope.ytmusic-player-bar';
const NEXT_TRACK_SELECTOR = '#left-controls > div > paper-icon-button.next-button.style-scope.ytmusic-player-bar';
const PLAY_PAUSE_SELECTOR = '#play-pause-button';

const SLIDER_SELECTOR = '#progress-bar';
const TIME_INFO_SELECTOR = '#left-controls > span.time-info';

const ALBUM_ART_SELECTOR = '#layout > ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > img';
const TITLE_SELECTOR = '#layout > ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > div.content-info-wrapper.style-scope.ytmusic-player-bar > yt-formatted-string';
const ARTIST_SELECTOR = '#layout > ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > div.content-info-wrapper.style-scope.ytmusic-player-bar > span > span.subtitle.style-scope.ytmusic-player-bar > yt-formatted-string > a:nth-child(1)';

const ALBUM_ART_RESIZE_REGEX = /(http.+=w)([0-9]+)(-h)([0-9]+)(-.+)/;
const ALBUM_ART_IMG_REPLACE_TEMPLATE = `$1${DEFAULT_MINI_PLAYER_BOUNDS.width}$3${DEFAULT_MINI_PLAYER_BOUNDS.height}$5`;

const SIGN_IN_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0';

export default class YouTubeMusic extends AbstractBroadcaster implements Broadcaster {
    constructor() {
        super();

        this.id = 'youtube-music';
        this.name = 'YouTube Music';
        this.url = 'https://music.youtube.com/';

        this.hasPreviousTrack = true;
        this.hasNextTrack = true;
        this.hasProgress = true;
        this.hasAlbumArt = true;
        this.hasArtist = true;
        this.hasTitle = true;
    }

    public configure(window: Electron.BrowserWindow): void {
        // Thanks to Samuel Attard (https://www.samuelattard.com/) for this snippet to overcome
        // login issues on YouTube music
        //
        // Intercept all requests to accounts.google.com and hijack the UA
        window.webContents.session.webRequest.onBeforeSendHeaders({
          urls: ['https://accounts.google.com/*'],
        }, (details, callback) => {
          const newRequestHeaders = Object.assign({}, (details.requestHeaders || {}), {
            'User-Agent': SIGN_IN_USER_AGENT,
          });

          callback({ requestHeaders: newRequestHeaders });
        });    
	}

    public getCurrentState(): BroadcasterPlayerState {
        const controlsAvailable = this.hasElement(PLAY_PAUSE_SELECTOR);
        const playing = controlsAvailable && (this.getAttribute(PLAY_PAUSE_SELECTOR, 'aria-label') === 'Pause');

        const state = {
            playerControlsAvailable: controlsAvailable,
            playing: playing,

            artist: this.getElementText(ARTIST_SELECTOR),
            title: this.getElementText(TITLE_SELECTOR),
            imageSrc: controlsAvailable ? this.getImgSrc() : '',

            progress: controlsAvailable ? this.calculateProgress() : 0,
            progressPrefix: controlsAvailable ? this.getProgressPrefix() : '',
            progressSuffix:  controlsAvailable ? this.getProgressSuffix() : '',
        } as BroadcasterPlayerState;

        return state;
    }

    public previousTrack(): void {
        this.logger.info('previousTrack');
        if (this.hasElement(PREV_TRACK_SELECTOR)) {
            this.clickElement(PREV_TRACK_SELECTOR);
        }
    }

    public nextTrack(): void {
        this.logger.info('nextTrack');
        if (this.hasElement(NEXT_TRACK_SELECTOR)) {
            this.clickElement(NEXT_TRACK_SELECTOR);
        }
    }

    public playPause(): void {
        this.logger.info('playPause');
        if (this.hasElement(PLAY_PAUSE_SELECTOR)) {
            this.clickElement(PLAY_PAUSE_SELECTOR);
        }
    }

    private calculateProgress(): number | undefined {
        // aria-valuenow="143550" aria-valuemin="0" aria-valuemax="172000" 
        const min = this.getAttribute(SLIDER_SELECTOR, 'aria-valuemin');
        const minValue = (min !== undefined) ? Number(min) : 0;

        const max = this.getAttribute(SLIDER_SELECTOR, 'aria-valuemax');
        const maxValue = (max !== undefined) ? Number(max) : 1;

        const now = this.getAttribute(SLIDER_SELECTOR, 'aria-valuenow');
        const nowValue = (now !== undefined) ? Number(now) : 1;

        return (nowValue / (maxValue - minValue)) * 100;
    }

    private getImgSrc(): string {
        const imgSrc = this.getImageSource(ALBUM_ART_SELECTOR);
        return hasValue(imgSrc) ? imgSrc!.replace(ALBUM_ART_RESIZE_REGEX, ALBUM_ART_IMG_REPLACE_TEMPLATE) : '';
    }

    private getProgressPrefix(): string {
        const timeInfo = this.getTimeInfo();
        return hasValue(timeInfo) ? timeInfo![0].trim() : '';
    }

    private getProgressSuffix(): string {
        const timeInfo = this.getTimeInfo();
        return hasValue(timeInfo) ? timeInfo![1].trim() : '';
    }

    private getTimeInfo(): string[] | undefined {
        const timeInfo = this.getElementText(TIME_INFO_SELECTOR);
        return hasValue(timeInfo) ? timeInfo!.split('/') : undefined;
    }
}
