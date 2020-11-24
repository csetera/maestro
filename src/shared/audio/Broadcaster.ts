import BroadcasterPlayerState from '@/shared/audio/BroadcasterPlayerState';
import * as winston from 'winston';

/**
 * Broadcaster implementations are injected into the
 * for the associated web audio application renderer process.
 * Broadcaster implementations communicate with the main process
 * via IPC to update the state of playback as well as receiving
 * events to control playback.
 * 
 * This abstract superclass provides default handling and structure
 * for implementing the Broadcaster interface.
 */
export default interface Broadcaster {
    id: string;
    name: string;
    disabled: boolean;
    url: string;
    
    logger: winston.Logger;
    hasPreviousTrack: boolean;
    hasNextTrack: boolean;
    hasSeparateStop: boolean;
    
    hasProgress: boolean;
    hasProgressPrefix: boolean;
    hasProgressSuffix: boolean;

    hasAlbumArt: boolean;
    hasArtist: boolean;
    hasGenre: boolean;
    hasStation: boolean;
    hasTitle: boolean;

    configure(window: Electron.BrowserWindow): void;
    getCurrentState(): BroadcasterPlayerState;
    previousTrack(): void;
    nextTrack(): void;
    playPause(): void;
    stop(): void;
}