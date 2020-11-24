<template>
  <div class="buttons-container">
    <b-button v-if="hasPreviousTrack" @click="onPreviousTrack" pill variant="outline-dark">
      <font-awesome-icon icon="arrow-left" size="lg" />
    </b-button>
    <b-button @click="onPlayPause" pill variant="outline-dark" :disabled="playPauseDisabled">
      <font-awesome-icon :icon="playPauseIcon" size="lg" />
    </b-button>
    <b-button v-if="hasNextTrack" @click="onNextTrack" pill variant="outline-dark">
      <font-awesome-icon icon="arrow-right" size="lg" />
    </b-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { ipcRenderer } from 'electron';
import { MEDIA_CONTROL } from '@/shared/constants/IpcCommands';

import Broadcaster from '@/shared/audio/Broadcaster';
import BroadcasterPlayerState from '@/shared/audio/BroadcasterPlayerState';
import MediaKeys from '@/shared/constants/MediaKeys';

@Component
export default class MediaButtons extends Vue {
  @Prop(Object)
  public readonly broadcaster!: Broadcaster;

  @Prop(Object)
  public readonly playerState!: BroadcasterPlayerState;

  // PROPERTIES

  public get hasPreviousTrack(): boolean {
    return this.playerControlsAvailable && this.broadcaster && this.broadcaster.hasPreviousTrack;
  }

  public get hasNextTrack(): boolean {
    return this.playerControlsAvailable && this.broadcaster && this.broadcaster.hasNextTrack;
  }

  public get isPlaying(): boolean {
    return this.playerControlsAvailable && (this.playerState.playing === true);
  }

  public get playerControlsAvailable(): boolean {
    return (this.broadcaster !== null) && (this.playerState !== null) && (this.playerState.playerControlsAvailable === true);
  }

  public get playPauseDisabled(): boolean {
    return !this.playerControlsAvailable;
  }

  public get playPauseIcon(): string {
    return this.isPlaying ? "pause" : "play";
  }

  // EVENT HANDLERS

  public onPreviousTrack(): void {
    ipcRenderer.send(MEDIA_CONTROL, MediaKeys.MEDIA_PREVIOUS_TRACK);
  }

  public onPlayPause(): void {
    ipcRenderer.send(MEDIA_CONTROL, MediaKeys.MEDIA_PLAY_PAUSE);
  }

  public onNextTrack(): void {
    ipcRenderer.send(MEDIA_CONTROL, MediaKeys.MEDIA_NEXT_TRACK);
  }
}
</script>

<style scoped lang="scss">

.buttons-container {
  padding-bottom: 8px;
}

button {
  margin: 3px;
}

</style>