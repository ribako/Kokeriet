// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './App';
import router from './router';

Vue.config.productionTip = false;

Vue.use(VueResource);
Vue.config.dhis2url = '../../..';

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
  data: {
    organizations: [],
    stockItems: [],
    data: [],
    admin: false,
  },
  created() {
    this.fetchOrganizations();
    this.fetchStockItems();
    this.getMaxLevel(0);
    this.checkAdmin();
  },
  methods: {
    checkAdmin() {
      this.$http.get(`${Vue.config.dhis2url}/api/me/authorization`, {
        headers: {
          Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
        },
      }).then((response) => {
        this.admin = response.body.includes('F_PROGRAM_DASHBOARD_CONFIG_ADMIN');
      });
    },
    fetchOrganizations() {
      this.$http.get(`${Vue.config.dhis2url}/api/organisationUnits?paging=false`, {
        headers: {
          Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
        },
      }).then((response) => {
        this.organizations = response.body.organisationUnits;
      });
    },
    fetchStockItems() {
      this.$http.get(`${Vue.config.dhis2url}/api/dataElements?paging=false`, {
        headers: {
          Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
        },
      }).then((response) => {
        this.stockItems = response.body.dataElements;
      });
    },
    getMaxLevel(len, first) {
      this.$http.get(`${Vue.config.dhis2url}/api/26/organisationUnits.json?level=${len + 1}&fields=id,displayName~rename(text)&paging=false`, {
        headers: {
          Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
        },
      }).then((response) => {
        if (response.body.organisationUnits.length === 0) {
          this.getHierarchy(len, first);
        } else {
          this.getMaxLevel(len + 1, first || response.body);
        }
      });
    },
    getHierarchy(maxLevel, first) {
      first.organisationUnits.forEach((elem) => {
        Vue.set(elem, 'children', []);
        this.data.push(elem);
        this.recurseHierarchy(elem.id, elem.children, 1, maxLevel);
      });
    },
    recurseHierarchy(elemId, childBox, level, maxLevel) {
      if (level < maxLevel) {
        this.$http.get(`${Vue.config.dhis2url}/api/26/organisationUnits/${elemId}?includeChildren&fields=displayName~rename(text),id&paging=false`, {
          headers: {
            Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
          },
        }).then((response) => {
          for (let i = 1; i < response.body.organisationUnits.length; i += 1) {
            Vue.set(response.body.organisationUnits[i], 'children', []);
            childBox.push(response.body.organisationUnits[i]);
            this.recurseHierarchy(response.body.organisationUnits[i].id,
              response.body.organisationUnits[i].children, level + 1, maxLevel);
          }
        });
      }
    },
  },
});
