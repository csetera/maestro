import Broadcaster from '@/shared/audio/Broadcaster';
import BroadcasterPlayerState from './shared/audio/BroadcasterPlayerState';
import LoggerFactory from '@/shared/LoggerFactory';
import MediaKeys from '@/shared/constants/MediaKeys';
import { broadcasterWithId } from '@/shared/audio/Broadcasters';
import * as IpcCommands from '@/shared/constants/IpcCommands';
import * as winston from 'winston';

const UPDATE_LOOP_MILLIS = 1000;

const ipc = require('electron').ipcRenderer;

/**
 * Interoperation class that is injected in to the audio player 
 * window as a preload script.  This script is build and published 
 * into the public/js folder.  The injected script is responsible
 * for managing the connection between the main Electron process
 * and the audio player, sending status updates and receiving
 * controller events.  This functionality is implemented via a 
 * Broadcaster instance
 * 
 * Status updates are managed by a standard Javascript interval
 * which retrieves the status information from the Broadcaster
 * and forwards the information over IPC.
 * 
 * Events are received from the main process via IPC and provided
 * to the Broadcaster.
 * 
 * NOTE: This class is processed by Webpack and the results are
 * generated into public/js/preload.js
 */
const Interop = class Interop {
	private logger: winston.Logger;
	private broadcaster?: Broadcaster;
	private playerState?: BroadcasterPlayerState;
	private updateLoopId?: number;
	private sendingUpdates = true;

	constructor() {
		this.logger = LoggerFactory.createIpcLogger(ipc, 'INTEROP');
		this.logger.info("Initializing");

		ipc.on(IpcCommands.MEDIA_CONTROL, (event: any, mediaControlEvent: string) => 
			this.onMediaControlEvent(mediaControlEvent));
		ipc.on(IpcCommands.SHUTDOWN_INTEROP, (event: any, arg: string) => this.onShutdown());

		this.logger.debug("Requesting current broadcaster id");
		const broadcasterId = ipc.sendSync(IpcCommands.GET_CURRENT_BROADCASTER, null);

		this.broadcaster = broadcasterWithId(broadcasterId);
		this.broadcaster!.logger = this.logger.child({ label: broadcasterId });

		this.updateLoopId = window.setInterval(() => this.updateLoop(), UPDATE_LOOP_MILLIS);
	}

	/**
	 * Handle a media control event.
	 * 
	 * @param mediaControlEvent 
	 */
	private onMediaControlEvent(mediaControlEvent: string): void {
		this.logger.debug('onMediaControlEvent: %s', mediaControlEvent);
		switch (mediaControlEvent) {
			case MediaKeys.MEDIA_NEXT_TRACK:
				if (this.broadcaster) {
					this.broadcaster.nextTrack();
				}
				break;

			case MediaKeys.MEDIA_PLAY_PAUSE:
				if (this.broadcaster) {
					this.broadcaster.playPause();

				}
				break;
			
			case MediaKeys.MEDIA_PREVIOUS_TRACK:
				if (this.broadcaster) {
					this.broadcaster.previousTrack();
				}
				break;
			
			case MediaKeys.MEDIA_STOP:
				if (this.broadcaster) {
					this.broadcaster.stop();
				}
				break;
		}
	}

	/**
	 * Manage a shutdown message from the main process
	 */
	private onShutdown(): void {
		this.logger.debug("Shutting down");
		if (this.playerState && this.playerState.playing) {
			this.logger.debug('Pausing previous broadcaster: %s', this.broadcaster!.id);
			this.broadcaster!.playPause();
		}

		if (this.updateLoopId) {
			this.logger.debug('Cancelling update loop: %d', this.updateLoopId);
			window.clearInterval(this.updateLoopId);
			this.updateLoopId = undefined;
		}

		ipc.send(IpcCommands.INTEROP_SHUTDOWN_COMPLETE, null);
	}

	/**
	 * Send player status updates
	 */
	private updateLoop(): void {
		if (this.broadcaster) {
			try {
				this.playerState = this.broadcaster.getCurrentState();
				ipc.send(IpcCommands.PLAYER_STATUS_UPDATE, this.playerState);
			} catch (e) {
				this.logger.error("Error updating player state", e);
			}
		}

		if (!this.sendingUpdates && this.updateLoopId) {
			window.clearInterval(this.updateLoopId);
			this.updateLoopId = undefined;
		}
	}
};

declare global {
    interface Window { 
		_maestro_interop: any; 
		__devtron: any;
	}
}
window._maestro_interop = new Interop();
