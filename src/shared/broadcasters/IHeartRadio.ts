import Broadcaster from '@/shared/audio/Broadcaster';
import AbstractBroadcaster from '@/shared/audio/AbstractBroadcaster';
import BroadcasterPlayerState from '@/shared/audio/BroadcasterPlayerState';

const ARTIST_SELECTOR = 'div[data-test=mini-player-description-text] > a'; // TEXT
const ARTWORK_SELECTOR = 'div[data-test=mini-player-artwork-image] > img'; // SRC
const SONG_SELECTOR = 'div[data-test=mini-player-track-text] > a'; // TEXT
const STATION_SELECTOR = 'div[data-test=mini-player-station-text] > a'; // TEXT

const PLAY_PAUSE_SELECTOR = 'button[data-test=play-button]';
const STATE_ATTR = 'data-test-state';
const STATE_PLAYING = 'playing';
const STATE_PAUSED = 'paused';

export default class IHeartRadio extends AbstractBroadcaster implements Broadcaster {
    constructor() {
        super();

        this.id = 'iheartradio';
        this.name = 'iHeartRadio';
        this.url = 'https://www.iheart.com/';
        this.hasAlbumArt = true;
        this.hasArtist = true;
        this.hasStation = true;
	    this.hasTitle = true;
    }

    public getCurrentState(): BroadcasterPlayerState {
        const buttonElement = document.querySelector(PLAY_PAUSE_SELECTOR);
        const stateAttr = buttonElement ? buttonElement.getAttribute(STATE_ATTR) : '';

        let imgSrc = this.getImageSource(ARTWORK_SELECTOR);
        if (imgSrc !== undefined) {
            if (imgSrc.startsWith('//')) {
                imgSrc = 'https:'  + imgSrc;
            }

            const imgSrcURL = new URL(imgSrc);
            imgSrcURL.search = '';
            imgSrc = imgSrcURL.toString();
        }

        const state = {
            playerControlsAvailable: (buttonElement !== null),
            playing: stateAttr === STATE_PLAYING,
            paused: stateAttr === STATE_PAUSED,

            artist: this.getElementText(ARTIST_SELECTOR),
            station: this.getElementText(STATION_SELECTOR),
            title: this.getElementText(SONG_SELECTOR),
            imageSrc: imgSrc,
        } as BroadcasterPlayerState;

        return state;
    }

    public playPause(): void {
        this.logger.info('playPause');
        if (this.hasElement(PLAY_PAUSE_SELECTOR)) {
            this.clickElement(PLAY_PAUSE_SELECTOR);
        }
    }
}
