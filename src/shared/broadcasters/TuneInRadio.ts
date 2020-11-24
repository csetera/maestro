import Broadcaster from '@/shared/audio/Broadcaster';
import BroadcasterPlayerState from '@/shared/audio/BroadcasterPlayerState';
import AbstractBroadcaster from '@/shared/audio/AbstractBroadcaster';

const ART_SELECTOR = '#playerArtwork'; 
const PLAY_PAUSE_STOP_BUTTON_SELECTOR = 'svg[data-testid^=player-status]';
const DATA_TESTID_KEY = 'data-testid';
const PAUSED_STATE_ID = 'player-status-paused';
const PLAYING_STATE_ID = 'player-status-playing';
const STOPPED_STATE_ID = 'player-status-stopped';

const SUBTITLE_SELECTOR = '#playerSubtitle';
const TITLE_SELECTOR = '#playerTitle';

const ELAPSED_TIME_SELECTOR = '#scrubberElapsed';
const DURATION_TIME_SELECTOR = '#scrubberDuration';
const SCRUBBER_INPUT_SELECTOR = '#scrubber input';

export default class TuneInRadio extends AbstractBroadcaster implements Broadcaster {
    constructor() {
        super();

        this.id = 'tunein-radio';
        this.name = 'TuneIn Radio';
        this.url = 'https://tunein.com';

        this.hasProgress = true;
        this.hasAlbumArt = true;
        this.hasStation = true;
	    this.hasTitle = true;
    }

    public getCurrentState(): BroadcasterPlayerState {
        const buttonElement = document.querySelector(PLAY_PAUSE_STOP_BUTTON_SELECTOR);
        const stateID = buttonElement ? buttonElement.getAttribute(DATA_TESTID_KEY) : '';

        const state = {
            playerControlsAvailable: (buttonElement !== null),
            playing: stateID === PLAYING_STATE_ID,
            paused: stateID === PAUSED_STATE_ID,
            stopped: stateID === STOPPED_STATE_ID,

            station: this.getElementText(SUBTITLE_SELECTOR),
            title: this.getElementText(TITLE_SELECTOR),
            imageSrc: this.getImageSource(ART_SELECTOR),

            progress: this.calculateProgress(),
            progressPrefix: this.getElementText(ELAPSED_TIME_SELECTOR),
            progressSuffix:  this.getElementText(DURATION_TIME_SELECTOR),
        } as BroadcasterPlayerState;

        return state;
    }

    public playPause(): void {
        if (this.hasElement(PLAY_PAUSE_STOP_BUTTON_SELECTOR)) {
            this.clickElement(PLAY_PAUSE_STOP_BUTTON_SELECTOR);
        }
    }

    private calculateProgress(): number {
        const scrubberInputElement = document.querySelector(SCRUBBER_INPUT_SELECTOR);
        if (scrubberInputElement) {
            return Number(scrubberInputElement.getAttribute('value'));
        } 

        return 0;
    }
}
