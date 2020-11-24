<template>
  <div class="metadata-container">
    <div v-if="hasStation" class="station">{{station}}</div>
    <div v-if="hasArtist" class="artist">{{artist}}</div>
    <div v-if="hasTitle" class="title">{{title}}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';

import Broadcaster from '@/shared/audio/Broadcaster';
import BroadcasterPlayerState from '@/shared/audio/BroadcasterPlayerState';

@Component
export default class MediaControls extends Vue {
  @Prop(Object)
  public readonly broadcaster!: Broadcaster;

  @Prop(Object)
  public readonly playerState!: BroadcasterPlayerState;

  // PROPERTIES

  public get hasArtist(): boolean {
    return this.playerState && (this.playerState.artist !== undefined);
  }
  public get hasStation(): boolean {
    return this.playerState && (this.playerState.station !== undefined);
  }

  public get hasTitle(): boolean {
    return this.playerState && (this.playerState.title !== undefined);
  }

  public get artist(): string {
    return this.hasArtist ? this.playerState!.artist as string : '';
  }

  public get station(): string {
    return this.hasStation ? this.playerState!.station as string : '';
  }

  public get title(): string {
    return this.hasTitle ? this.playerState!.title as string : '';
  }
}
</script>

<style scoped lang="scss">

.metadata-container {
  color: white;
  padding-top: 5px;
  padding-bottom: 5px;

  .station {
    font-size: 9pt;
  }

  .title {
    font-size: 12pt;
  }

  .artist {
    font-size: 12pt;
  }
}
</style>