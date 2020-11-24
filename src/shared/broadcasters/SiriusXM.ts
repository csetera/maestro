import Broadcaster from '@/shared/audio/Broadcaster';
import BroadcasterPlayerState from '@/shared/audio/BroadcasterPlayerState';
import AbstractBroadcaster from '@/shared/audio/AbstractBroadcaster';

const PREV_TRACK_SELECTOR = 'button.skip-back-btn';
const NEXT_TRACK_SELECTOR = 'button.skip-forward-btn';
const PLAY_PAUSE_SELECTOR = 'button.play-pause-btn';
const PLAY_PAUSE_IMG_SELECTOR = 'img.play-pause-btn__img';
const LOGO_IMG_SELECTOR = 'div.sxm-player-controls img.channel-image';

const ELAPSED_TIME_SELECTOR = 'span.elapsed-time';
const REMAINING_TIME_SELECTOR = 'span.remaining-time';

// Various station selectors
const CHANNEL_NAME_SELECTOR = 'p.channel-name';
const CHANNEL_NUMBER_SELECTOR = 'p.channel-number';
const SHOW_TITLE_SELECTOR = 'p.show-title';

const ARTIST_NAME_SELECTOR = 'p.artist-name';
const TRACK_NAME_SELECTOR = 'p.track-name';

const PROGRESS_BAR_WIDTH_SELECTOR = '#progress-bar-background';
const CURRENT_POSITION_SELECTOR = '#current-listening-position';

export default class SiriusXM extends AbstractBroadcaster implements Broadcaster {
    constructor() {
        super();

        this.id = 'siriusxm';
        this.name = 'SiriusXM';
        this.url = 'https://player.siriusxm.com';

        this.hasPreviousTrack = true;
        this.hasNextTrack = true;
        
        this.hasProgress = true;
        this.hasProgressPrefix = true;
        this.hasProgressSuffix = true;

        this.hasAlbumArt = true;
        this.hasArtist = true;
        this.hasStation = true;
        this.hasTitle = true;
    }

    public getCurrentState(): BroadcasterPlayerState {
        const state = {
            playerControlsAvailable: this.hasElement(PLAY_PAUSE_SELECTOR),
            playing: this.isPlaying(),

            station: this.getStation(),
            artist: this.getElementText(ARTIST_NAME_SELECTOR),
            title: this.getElementText(TRACK_NAME_SELECTOR),
            imageSrc: this.getLogoImage(),

            progress: this.calculateProgress(),
            progressPrefix: this.getElementText(ELAPSED_TIME_SELECTOR),
            progressSuffix:  this.getElementText(REMAINING_TIME_SELECTOR),
        } as BroadcasterPlayerState;

        return state;
    }

    public previousTrack(): void {
        if (this.hasElement(PREV_TRACK_SELECTOR)) {
            this.clickElement(PREV_TRACK_SELECTOR);
        }
    }

    public nextTrack(): void {
        if (this.hasElement(NEXT_TRACK_SELECTOR)) {
            this.clickElement(NEXT_TRACK_SELECTOR);
        }
    }

    public playPause(): void {
        if (this.hasElement(PLAY_PAUSE_SELECTOR)) {
            this.clickElement(PLAY_PAUSE_SELECTOR);
        }
    }

    private calculateProgress(): number {
        const currentPosWidth = this.getStyleWidth(CURRENT_POSITION_SELECTOR);
        const totalWidth = this.getElementClientWidth(PROGRESS_BAR_WIDTH_SELECTOR);

        return (totalWidth === 0) ? 0 : (currentPosWidth / totalWidth) * 100;
    }

    private getLogoImage(): string | undefined {
        return this.getImageSource(LOGO_IMG_SELECTOR);
    }

    private getStyleWidth(selector: string): number {
        const styleAttrs = this.getStyleAttributes(selector);
        if (styleAttrs && styleAttrs.width) {
            let widthString = styleAttrs.width as string;
            if (widthString.endsWith('px')) {
                widthString = widthString.substring(0, widthString.length - 2);
                return Number(widthString);
            }
        }

        return 0;
    }

    private getStation(): string | undefined {
        return this.getElementText(CHANNEL_NAME_SELECTOR) || 
            this.getElementText(CHANNEL_NUMBER_SELECTOR) ||
            this.getElementText(SHOW_TITLE_SELECTOR);
    }

    private isPlaying(): boolean {
        const imgSrc = this.getImageSource(PLAY_PAUSE_IMG_SELECTOR);
        return (imgSrc !== undefined) && imgSrc.endsWith('pause.svg');
    }
}
