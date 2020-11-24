import Broadcaster from '@/shared/audio/Broadcaster';
import AbstractBroadcaster from '../audio/AbstractBroadcaster';

const PREV_TRACK_SELECTOR = '#player-bar-rewind';
const NEXT_TRACK_SELECTOR = '#player-bar-forward';
const PLAY_PAUSE_SELECTOR = '#player-bar-play-pause';

export default class Spotify extends AbstractBroadcaster implements Broadcaster {
    constructor() {
        super();

        this.id = 'spotify';
        this.disabled = true;
        this.name = 'Spotify';
        this.url = 'https://open.spotify.com/';

        this.hasPreviousTrack = true;
        this.hasNextTrack = true;
        this.hasProgress = true;
        this.hasAlbumArt = true;
        this.hasArtist = true;
        this.hasStation = true;
        this.hasTitle = true;
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
}
