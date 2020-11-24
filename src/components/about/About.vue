<template>
    <div class="about">
      <svg viewBox="0 0 100 100" class="logo">
        <use xlink:href="logo.svg#logo"></use>
      </svg>

      <div class="right-column">
        <div class="title">Maestro</div>
        <div class="subtitle">Take control of your music</div>
        <table class="versions">
          <tr>
            <td class="name_col">Version</td>
            <td class="version_col">{{appVersion}}</td>
          </tr>
          <tr>
            <td class="name_col">Electron</td>
            <td class="version_col">{{electronVersion}}</td>
          </tr>
          <tr>
            <td class="name_col">Chrome</td>
            <td class="version_col">{{chromeVersion}}</td>
          </tr>
          <tr>
            <td class="name_col">Node</td>
            <td class="version_col">{{nodeVersion}}</td>
          </tr>
          <tr>
            <td class="name_col">V8</td>
            <td class="version_col">{{v8Version}}</td>
          </tr>
        </table>
      </div>
      <div class="bottom_row">
        <div>Copyright &copy; Craig Setera</div>
        <div>Distributed under Apache 2.0 license</div>
      </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";

@Component
export default class About extends Vue {
  public get appVersion(): string | undefined {
    return require('electron').remote.app.getVersion();
  }

  public get chromeVersion(): string {
    return process.versions['chrome'];
  }

  public get electronVersion(): string {
    return process.versions['electron'];
  }

  public get nodeVersion(): string {
    return process.versions['node'];
  }

  public get v8Version(): string {
    return process.versions['v8'];
  }
}
</script>

<style lang="scss" scoped>
.about {
  font-family: serif;
  color: rgba(255, 255, 255, 0.795);

  background: linear-gradient(0deg, rgba(0,0,0,1) 0%, rgb(9, 21, 116) 100%); 
  height: 100%;
  display: grid;
  justify-content: center;
  grid-template-columns: [left-column] 150px [right-column] auto;
  grid-template-rows: [top-row] auto [bottom-row] auto;
}

.logo {
  fill: steelblue;
  grid-column: left-column;
  grid-row: top-row;
  height: 100%;
  width: 100%;
}

.right-column {
  grid-column: right-column;
}

.title {
  margin-bottom: 10px;
  margin-top: 10px;
  font-size: 24pt;
}

.subtitle {
  font-size: 16pt;
  font-style: italic;
  margin-bottom: 30px;
}

.versions {
  width: 100%;
  border-collapse: separate;
  border-spacing: 8px 1px;
  font-size: 11pt;
}

.name_col {
  text-align: right;
}

.version_col {
  text-align: left;
}

.bottom_row {
  grid-column: 1 / -1;
  grid-row: bottom-row;
}
</style>
