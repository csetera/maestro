<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import MiniPlayer from '@/components/mini-player/MiniPlayer.vue';

@Component
export default class App extends Vue {
}
</script>

<style lang="scss">
@import '@/styles/bootswatch/cyborg/_variables.scss';
@import '~bootstrap';
@import '@/styles/bootswatch/cyborg/_bootswatch.scss';
@import '~bootstrap-vue';
@import '~load-awesome/css/ball-running-dots.css';

html, body { 
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
