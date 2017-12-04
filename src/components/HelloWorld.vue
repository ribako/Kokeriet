<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <select v-model="selectedOrg">
      <option v-for="org in organizations" :value="org.id">{{org.displayName}}</option>
    </select>
    <select v-model="selectedItem">
      <option v-for="item in stockItems" :value="item.id">{{item.displayName}}</option>
    </select>
    <v-jstree :data="data" show-checkbox whole-row @item-click="itemClick"></v-jstree>
    <input v-model="value[0]" type="number" :disable="this.disabled">
    <input v-model="value[1]" type="number" :disable="this.disabled">
    <vue-slider v-model="value" :min="this.min" :max="this.max" :disabled="this.disabled"></vue-slider>
    <line-example id="gE" ref="graphElem" :chart-data="datacollection" :options="options"></line-example>
  </div>
</template>

<script>
  import Vue from 'vue';
  import VJstree from 'vue-jstree';
  import vueSlider from 'vue-slider-component';
  import LineExample from './LineChart.jsx';

  function calculateGradientFill(ctx, scale, height, baseColor, gradientColor, gradientColor2, value,
    value2) {
    const yPos = scale.getPixelForValue(value);
    const yPos2 = scale.getPixelForValue(value2);
    const grd = ctx.createLinearGradient(0, height, 0, 0);
    const gradientStop = 1 - (yPos / height);
    const gradientStop2 = 1 - (yPos2 / height);


    try {
      grd.addColorStop(0, gradientColor);
      grd.addColorStop(gradientStop2, gradientColor);
      grd.addColorStop(gradientStop2, gradientColor2);
      grd.addColorStop(gradientStop, gradientColor2);
      grd.addColorStop(gradientStop, baseColor);
      grd.addColorStop(1.00, baseColor);

      return grd;
    } catch (e) {
      console.warn('ConfigError: Chart.Bands.js had a problem applying one or more colors please check that you have selected valid color strings');
      return baseColor;
    }
  }

  export default {
    name: 'HelloWorld',
    components: {
      LineExample,
      vueSlider,
      VJstree,
    },
    data() {
      return {
        msg: 'Welcome to Your Vue.js App',
        organizations: [],
        organizations2: [],
        stockItems: [],
        stockData: {},
        oldItem: null,
        oldOrg: null,
        oldValue: null,
        selectedItem: null,
        selectedOrg: null,
        disabled: true,
        min: 0,
        max: 100,
        value: [
          0,
          100,
        ],
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
        data: [],
        methods: {
          itemClick(node) {
            console.log(`${node.model.text} clicked !`);
          },
        },
      };
    },
    created() {
      this.fetchOrganizations();
      this.fetchStockItems();
      this.getHierarchy();
    },
    updated() {
      this.getDataForGraph();
      this.updateMinMax();
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
                labels.push(`${elem[1].slice(0, 4)} - ${elem[1].slice(4)}`);
                datasets[0].data.push(elem[3]);
              });
              this.datacollection = {
                labels,
                datasets,
              };
              this.max = 1.25 * Math.max(...this.datacollection.datasets[0].data);
            });
        }
      },
      updateMinMax() {
        if (this.value !== this.oldValue && this.datacollection.datasets[0]) {
          const labels = this.datacollection.labels;
          const datasets = this.datacollection.datasets;
          datasets[1].data = [];
          datasets[2].data = [];
          datasets[0].data.forEach(() => {
            datasets[1].data.push(this.value[0]);
            datasets[2].data.push(this.value[1]);
          });
          this.datacollection = {
            labels,
            datasets,
          };
          this.oldValue = this.value;
          this.disabled = false;
          /* eslint-disable */
          const chartInstance = this.$refs.graphElem._data._chart;
          /* eslint-enable */
          const node = chartInstance.chart.ctx;
          console.log(node);
          const fill = calculateGradientFill(
            node,
            chartInstance.scales['y-axis-0'],
            chartInstance.chart.height,
            '#0016bf',
            '#bf0400',
            '#00bf0a',
            this.value[1],
            this.value[0],
          );
          chartInstance.chart.config.data.datasets[0].borderColor = fill;
        }
      },
      getHierarchy() {
        this.$http.get('https://inf5750.dhis2.org/training/api/26/organisationUnits.json?level=1&fields=id,displayName~rename(text)&paging=false', {
          headers: {
            Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
          },
        }).then((response) => {
          this.organizations2 = response.body.organisationUnits;
          console.log(this.organizations2);
          let cnt = 0;
          this.organizations2.forEach((elem) => {
            console.log(elem.id);
            this.data.push(elem);
            this.$http.get(`https://inf5750.dhis2.org/training/api/26/organisationUnits/${elem.id}?fields=children`, {
              headers: {
                Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
              },
            }).then((response2) => {
              // console.log(response2.body.children);
              // console.log(this.data[cnt]);
              Vue.set(this.data[cnt], 'children', []);
              // this.data[cnt].children = [];
              this.recurseHierarchy(response2.body.children, this.data[cnt]);
              cnt += 1;
            });
          });
        });
      },
      recurseHierarchy(inputList, inputLevel) {
        let cnt = 0;
        inputList.forEach((elem) => {
          this.$http.get(`https://inf5750.dhis2.org/training/api/26/organisationUnits/${elem.id}?fields=id,displayName~rename(text),children~rename(list)`, {
            headers: {
              Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
            },
          }).then((response) => {
            // console.log(response.body);
            // console.log(inputLevel);
            inputLevel.children.push(response.body);
            Vue.set(inputLevel.children[cnt], 'children', []);
            this.recurseHierarchy(response.body.list, inputLevel.children[cnt]);
            cnt += 1;
          });
        });
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
