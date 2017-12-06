import Vue from 'vue';
import Router from 'vue-router';
import Graph from '@/components/Graph';
import Status from '@/components/Status';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Graph',
      component: Graph,
    },
    {
      path: '/status',
      name: 'Status',
      component: Status,
    },
  ],
});
