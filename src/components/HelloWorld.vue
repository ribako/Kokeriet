<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <select v-model="selectedOrg">
      <option v-for="org in organizations" :value="org.id">{{org.displayName}}</option>
    </select>
    <select v-model="selectedItem">
      <option v-for="item in stockItems" :value="item.id">{{item.displayName}}</option>
    </select>
    <h1>{{ data }}</h1>
    <line-example/>
  </div>
</template>

<script>
  import LineExample from './LineChart.jsx';

  /* const username = 'student';
  const password = 'INF5750!';
  const buf = new Buffer(`${username}:${password}`.toString('base64'));
  const auth = `Basic ${buf}`; */

  export default {
    name: 'HelloWorld',
    components: {
      LineExample,
    },
    data() {
      return {
        msg: 'Welcome to Your Vue.js App',
        organizations: [],
        stockItems: [],
        data: {},
        selectedItem: null,
        selectedOrg: null,
      };
    },
    created() {
      this.fetchOrganizations();
      this.fetchStockItems();
    },
    updated() {
      this.getDataForGraph();
    },
    methods: {
      fetchOrganizations() {
        this.$http.get('https://inf5750.dhis2.org/demo/api/organisationUnits?paging=false', {
          headers: {
            Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
          },
        }).then((response) => {
          this.organizations = response.body.organisationUnits;
        });
      },
      fetchStockItems() {
        this.$http.get('https://inf5750.dhis2.org/demo/api/dataElements?paging=false', {
          headers: {
            Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
          },
        }).then((response) => {
          this.stockItems = response.body.dataElements;
        });
      },
      getDataForGraph() {
        if (this.selectedItem && this.selectedOrg) {
          this.$http.get(`https://inf5750.dhis2.org/demo/api/26/analytics?dimension=dx:${this.selectedItem}`
            + `&dimension=pe:2016Q1;2016Q2&dimension=ou:${this.selectedOrg}`, {
              headers: {
                Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
              },
            }).then((response) => {
              this.data = response.body;
            });
        }
      },
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }
</style>
