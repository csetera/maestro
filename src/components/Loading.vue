<template>
  <!-- The browser view will overlay this space if not in mini mode -->
  <div class="loading_wrapper">
    <svg viewBox="0 0 100 100" class="logo">
      <use xlink:href="logo.svg#logo"></use>
    </svg>
    <div class="spinner">
      <div style="color: steelblue" class="la-ball-running-dots la-2x">
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";

@Component
export default class Loading extends Vue {}
</script>

<style lang="scss" scoped>
.loading_wrapper {
  height: 100%;
  display: grid;
  grid-template-columns: [left-column] auto [center-column] 250px [right-column] auto;
  grid-template-rows: [top-row] auto [row-2] 250px [row-3] 100px [bottom-row] auto;
}

.logo {
  fill: steelblue;
  grid-column: center-column;
  grid-row: row-2;
  height: 100%;
  width: 100%;
}

.spinner {
  grid-column: center-column;
  grid-row: row-3;
  height: 100%;
  width: 100%;
}

.spinner > div {
  margin-top: 50px;
  margin-left: 80px;
}

</style>
