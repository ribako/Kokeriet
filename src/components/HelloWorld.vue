<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <select v-model="selectedOrg">
      <option v-for="org in organizations" :value="org.id">{{org.displayName}}</option>
    </select>
    <select v-model="selectedItem">
      <option v-for="item in stockItems" :value="item.id">{{item.displayName}}</option>
    </select>
    <h1>{{ stockData }}</h1>
    <line-example :chart-data="datacollection" :options="{responsive: true, maintainAspectRatio: false}"></line-example>
  </div>
</template>

<script>
  // import Vue from 'vue';
  import LineExample from './LineChart.jsx';


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
        stockData: {},
        oldItem: null,
        oldOrg: null,
        selectedItem: null,
        selectedOrg: null,
        datacollection: {
          labels: [],
          datasets: [{
            label: 'Stuff',
            data: [],
          }],
        },
      };
    },
    created() {
      this.fetchOrganizations();
      this.fetchStockItems();
    },
    updated() {
      this.getDataForGraph();
    },
    mounted() {
    },
    methods: {
      fetchOrganizations() {
        this.$http.get('https://inf5750.dhis2.org/training/api/organisationUnits?paging=false', {
          headers: {
            Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
          },
        }).then((response) => {
          this.organizations = response.body.organisationUnits;
        });
      },
      fetchStockItems() {
        this.$http.get('https://inf5750.dhis2.org/training/api/dataElements?paging=false', {
          headers: {
            Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
          },
        }).then((response) => {
          this.stockItems = response.body.dataElements;
        });
      },
      getDataForGraph() {
        if (this.selectedItem !== this.oldItem && this.selectedOrg !== this.oldOrg) {
          this.oldItem = this.selectedItem;
          this.oldOrg = this.selectedOrg;
          this.$http.get(`https://inf5750.dhis2.org/training/api/26/analytics?dimension=dx:${this.selectedItem}`
            + `&dimension=pe:LAST_12_MONTHS&dimension=ou:${this.selectedOrg}`, {
              headers: {
                Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
              },
            }).then((response) => {
              this.stockData = response.body.rows;
              // Should really move the following to a method which isn't called every god damn ms
              // this.datacollection.labels = [this.stockData[0][1], this.stockData[1][1]]
              this.stockData.forEach((elem) => {
                this.datacollection.labels.push(elem[1]);
                this.datacollection.datasets[0].data.push(10);
              });
              console.log(this.datacollection.labels);
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
