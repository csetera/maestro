import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import App from '@/components/App.vue';
import LoggerFactory from '@/shared/LoggerFactory';
import router from './router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faArrowLeft, 
  faArrowRight,
  faPause, 
  faPlay,
  faStop} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

/**
 * Sets up Vue in the renderer interfaces.
 */


library.add(  
  faArrowLeft, 
  faArrowRight,
  faPause, 
  faPlay,
  faStop);
Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.use(BootstrapVue);
Vue.config.productionTip = false;

// Wire up a logger for the controller
const ipc = require('electron').ipcRenderer;
Vue.prototype.$logger = LoggerFactory.createIpcLogger(ipc, "RENDERER");
Vue.prototype.$logger.info("Renderer initialized");

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
