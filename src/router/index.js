import Vue from 'vue';
import Router from 'vue-router';
import HelloWorld from '@/components/HelloWorld';
import OtherWorld from '@/components/OtherWorld';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: HelloWorld,
    },
    {
      path: '/other',
      name: 'Other',
      component: OtherWorld,
    },
  ],
});
