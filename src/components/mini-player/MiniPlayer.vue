<template>
  <div class="container" :style="style">
    <div v-if="playerControlsAvailable" class="controls-container">
      <MediaMetadata v-if="hasMetadata" :playerState="playerState" />
      <MediaProgress v-if="hasProgress" :broadcaster="broadcaster" :playerState="playerState" />
      <MediaButtons :broadcaster="broadcaster" :playerState="playerState" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { hasValue } from '@/shared/Utils';
import { ipcRenderer, remote } from 'electron';
import { broadcasterWithId, DummyBroadcaster } from '@/shared/audio/Broadcasters';
import { EventEmitter } from 'events';
import * as IpcCommands from '@/shared/constants/IpcCommands';

import Broadcaster from '@/shared/audio/Broadcaster';
import BroadcasterPlayerState from '@/shared/audio/BroadcasterPlayerState';

import MediaKeys from '@/shared/constants/MediaKeys';
import MediaButtons from '@/components/mini-player/MediaButtons.vue';
import MediaMetadata from '@/components/mini-player/MediaMetadata.vue';
import MediaProgress from '@/components/mini-player/MediaProgress.vue';

@Component({
  components: {
    MediaButtons,
    MediaMetadata,
    MediaProgress
  }
})
export default class MiniPlayer extends Vue {
  private broadcaster: Broadcaster = new DummyBroadcaster();
  private playerState: BroadcasterPlayerState = { playerControlsAvailable: false };
  
  constructor() {
    super();

    ipcRenderer.on(IpcCommands.SET_BROADCASTER, (emitter: any, broadcasterId: string) => this.setBroadcaster(broadcasterId));
    ipcRenderer.on(
      IpcCommands.PLAYER_STATUS_UPDATE, 
      (emitter: any, playerState: BroadcasterPlayerState) => this.updatePlayerState(playerState));
    ipcRenderer.on(IpcCommands.SET_MINI_MODE_STATE, (emitter: any, miniMode: boolean) => this.setMiniMode(miniMode));
  }

  // LIFECYCLE

  public mounted(): void {
		this.$logger.debug("Requesting current player id");
		const playerId = ipcRenderer.sendSync(IpcCommands.GET_CURRENT_BROADCASTER, null);
    this.$logger.debug("Received current player id: %s", playerId);
    this.setBroadcaster(playerId);
  }

  private setMiniMode(mini: boolean): void {
    this.$logger.debug('Setting mini mode: %s', mini);
    Vue.set(this, 'miniMode', mini);
  }

  private setBroadcaster(broadcasterId: string): void {
    this.$logger.debug('setPlayer: %s', broadcasterId);
    Vue.set(this, 'broadcaster', broadcasterWithId(broadcasterId));
  }

  private updatePlayerState(playerState: BroadcasterPlayerState): void {
    Vue.set(this, 'playerState', playerState)
  }

  // PROPERTIES

  public get backgroundImageSrc(): string {
    return (hasValue(this.playerState) && hasValue(this.playerState.imageSrc)) ? this.playerState.imageSrc! : "./icon.png"; 
  }

  public get hasMetadata(): boolean {
    return hasValue(this.broadcaster) &&
      (this.broadcaster.hasAlbumArt || this.broadcaster.hasTitle || this.broadcaster.hasStation || this.broadcaster.hasArtist || this.broadcaster.hasGenre);
  }

  public get hasProgress(): boolean {
    return hasValue(this.broadcaster) && this.broadcaster.hasProgress;
  }

  public get playerControlsAvailable(): boolean {
    return hasValue(this.broadcaster) && hasValue(this.playerState) && (this.playerState.playerControlsAvailable === true);
  }

  public get style(): object {
    let imgSrc = this.backgroundImageSrc;
    return {
      'background-image': `url(${imgSrc})`
    };
  }
}
</script>

<style scoped lang="scss">
.container {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: contain;
  text-align: center;

  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;

  position: absolute;
}

.controls-container {
  background: rgba(37, 37, 37, 0.7);
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;

  width: 100%;
  position: absolute;
  bottom: 0;
}
</style>
