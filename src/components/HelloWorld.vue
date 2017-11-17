<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <select v-model="selectedOrg">
      <option v-for="org in organizations" :value="org.id">{{org.displayName}}</option>
    </select>
    <select v-model="selectedItem">
      <option v-for="item in stockItems" :value="item.id">{{item.displayName}}</option>
    </select>
    <input type="range" min="1" max="100" value="1" class="slider" id="min">
    <input type="range" min="1" max="100" value="1" class="slider" id="max">
    <!--<h1>{{ stockData }}</h1>-->
    <line-example :chart-data="datacollection" :options="options"></line-example>
  </div>
</template>

<script>
  // import Vue from 'vue';
  import LineExample from './LineChart.jsx';

  // TODO install awesome slider from either https://nightcatsama.github.io/vue-slider-component/example/#QuickStart or somewhere else

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
        oldMin: null,
        oldMax: null,
        min: null,
        max: null,
        selectedItem: null,
        selectedOrg: null,
        datacollection: {},
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
              },
              gridLines: {
                display: true,
              },
            }],
            xAxes: [{
              gridLines: {
                display: false,
              },
            }],
          },
          legend: {
            display: true,
          },
          responsive: true,
          maintainAspectRatio: false,
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
        if (this.selectedItem && this.selectedOrg && (this.selectedItem !== this.oldItem
            || this.selectedOrg !== this.oldOrg)) {
          const labels = [];
          const datasets = [{
            label: 'Data',
            borderColor: '#0016bf', // Color of the line
            backgroundColor: 'rgba(0, 0, 0, 0)', // Makes the fill under the line 100% transparent
            pointBackgroundColor: 'white',
            borderWidth: 1,
            pointBorderColor: '#249EBF',
            data: [],
          },
          {
            label: 'Min',
            borderDash: [40, 10],
            borderColor: '#bf000a',
            pointRadius: 0,
            backgroundColor: 'rgba(0, 0, 0, 0)',
            borderWidth: 1,
            pointBorderColor: '#6d6e6c',
            data: [],
          },
          {
            label: 'Max',
            borderDash: [40, 10],
            borderColor: '#bf000a',
            pointRadius: 0,
            backgroundColor: 'rgba(0, 0, 0, 0)',
            borderWidth: 1,
            pointBorderColor: '#6d6e6c',
            data: [],
          }];
          this.oldItem = this.selectedItem;
          this.oldOrg = this.selectedOrg;
          this.$http.get(`https://inf5750.dhis2.org/training/api/26/analytics?dimension=dx:${this.selectedItem}`
            + `&dimension=pe:LAST_12_MONTHS&dimension=ou:${this.selectedOrg}`, {
              headers: {
                Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
              },
            }).then((response) => {
              this.stockData = response.body.rows;

              function sortFunction(a, b) {
                if (a[1] === b[1]) {
                  return 0;
                }
                return (a[1] < b[1]) ? -1 : 1;
              }

              this.stockData.sort(sortFunction);
              this.stockData.forEach((elem) => {
                labels.push(elem[1]);
                datasets[0].data.push(elem[3]);
                datasets[1].data.push(50000);
                datasets[2].data.push(80000);
              });
              this.datacollection = {
                labels,
                datasets,
              };
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
