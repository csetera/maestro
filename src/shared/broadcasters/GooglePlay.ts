import Broadcaster from '@/shared/audio/Broadcaster';
import BroadcasterPlayerState from '@/shared/audio/BroadcasterPlayerState';
import AbstractBroadcaster from '@/shared/audio/AbstractBroadcaster';

const ALBUM_ART_SELECTOR = '#playerBarArt';
const ARTIST_SELECTOR = '#player-artist';
const CURRENT_TIME_SELECTOR = '#time_container_current';
const DURATION_TIME_SELECTOR = '#time_container_duration';
const PREV_TRACK_SELECTOR = '#player-bar-rewind';
const NEXT_TRACK_SELECTOR = '#player-bar-forward';
const PLAY_PAUSE_SELECTOR = '#player-bar-play-pause';
const SLIDER_SELECTOR = '#material-player-progress';
const TITLE_SELECTOR = '#currently-playing-title';

const ID = 'google-play';
const NAME = 'Google Play';
const URL = 'https://play.google.com/music/listen';

/**
 * Google Play integration.
 * 
 * NOTE: This is currently disabled due to the impending
 * closure of this service by Google.
 */
export default class GooglePlay extends AbstractBroadcaster implements Broadcaster {
    constructor() {
        super();

        this.id = ID;
        this.name = NAME;
        this.url = URL;

        this.hasPreviousTrack = true;
        this.hasNextTrack = true;
        this.hasProgress = true;
        this.hasAlbumArt = true;
        this.hasArtist = true;
        this.hasTitle = true;
    }

    public getCurrentState(): BroadcasterPlayerState {
        const state = {
            playerControlsAvailable: this.hasElement(PLAY_PAUSE_SELECTOR),
            playing: this.getAttribute(PLAY_PAUSE_SELECTOR, 'aria-label') === 'Pause',

            artist: this.getElementText(ARTIST_SELECTOR),
            title: this.getElementText(TITLE_SELECTOR),
            imageSrc: this.getImageSource(ALBUM_ART_SELECTOR),

            progress: this.calculateProgress(),
            progressPrefix: this.getElementText(CURRENT_TIME_SELECTOR),
            progressSuffix:  this.getElementText(DURATION_TIME_SELECTOR),
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
}
