<template>
  <div class="progress-container">
    <span v-if="hasPrefix" class="prefix">{{ prefix }}</span>
    <b-progress height="5px" :value="progressValue" />
    <span v-if="hasSuffix" class="suffix">{{ suffix }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { ipcRenderer } from 'electron';
import { MEDIA_CONTROL } from '@/shared/constants/IpcCommands';

import Broadcaster from '@/shared/audio/Broadcaster';
import BroadcasterPlayerState from '@/shared/audio/BroadcasterPlayerState';
import MediaKeys from '@/shared/constants/MediaKeys';
import path from 'path';

@Component
export default class MediaControls extends Vue {
  @Prop(Object)
  public readonly broadcaster!: Broadcaster;

  @Prop(Object)
  public readonly playerState!: BroadcasterPlayerState;

  // PROPERTIES
  public get playerControlsAvailable(): boolean {
    return (this.broadcaster !== null) && (this.playerState !== null) && (this.playerState.playerControlsAvailable === true);
  }

  public get hasPrefix(): boolean {
    return this.playerControlsAvailable && (this.playerState.progressPrefix !== undefined);
  }

  public get hasSuffix(): boolean {
    return this.playerControlsAvailable && (this.playerState.progressSuffix !== undefined);
  }

  public get prefix(): string {
    return this.hasPrefix ? this.playerState!.progressPrefix as string : '';
  }

  public get progressValue(): number {
    return this.playerControlsAvailable ? this.playerState!.progress as number : 0;
  }
  
  public get suffix(): string {
    return this.hasSuffix ? this.playerState!.progressSuffix as string : '';
  }
}
</script>

<style scoped lang="scss">

.progress-container {
  padding-bottom: 8px;

  display: grid;
  grid-template-columns: [left-column] 15% [center-column] auto [right-column] 15%;
  grid-template-rows: [the-row] 100%;
  font-size: 8pt;

  .prefix {
    color: white;
    grid-column: left-column;
    grid-row: the-row;
    margin-right: 3px;
  }

  .progress {
    grid-column: center-column;
    grid-row: the-row;
  }

  .suffix {
    color: white;
    grid-column: right-column;
    grid-row: the-row;
    margin-left: 5px;
  }
}

</style>