import Vue from 'vue';
import Router from 'vue-router';
import About from '@/components/about/About.vue';
import MiniPlayer from '@/components/mini-player/MiniPlayer.vue';

Vue.use(Router);

/**
 * Use vue-router to support different renderer functionality based
 * on the incoming request URL
 */

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    { path: '/about', name: 'About', component: About },
    { path: '/mini-player', name: 'mini-player', component: MiniPlayer },
  ],
});
