<template>
  <div class="hello">
    <div id="menu"><a href="#/"><div class="sel">Graph</div></a><a href="#/other"><div>Other ting</div></a></div>
    <h1>{{ msg }}</h1>
    <div class="menu">
      <div class="topbar">
        <div>
          <p>Organization: </p>
          <v-select :on-change="setOrg" label="displayName" :options="organizations"></v-select>
        </div>
        <div>
          <p>Stock item: </p>
          <v-select :on-change="setStockItem" label="displayName" :options="stockItems"></v-select>
        </div>
      </div>
      <input v-model="value[0]" type="number" :disable="disabled">
      <input v-model="value[1]" type="number" :disable="disabled">
      <vue-slider tooltip="hover" :slider-style="{'background-color': '#3F51B5'}" :process-style="{'background-color': '#3F51B5'}" :tooltip-style="{'background-color': '#3F51B5', 'border': '1px solid #3F51B5'}" v-model="value" :min="min" :max="max" :disabled="disabled"></vue-slider>
      <button v-on:click="seen = !seen">Toggle Tree</button>
      <v-jstree v-if="seen" class="tree-box" :data="data" show-checkbox whole-row @item-click="itemClick"></v-jstree>
    </div>
    <line-example id="gE" ref="graphElem" :chart-data="datacollection" :options="options"></line-example>
  </div>
</template>

<script>
  import Vue from 'vue';
  import VJstree from 'vue-jstree';
  import vueSlider from 'vue-slider-component';
  import vSelect from 'vue-select';
  import Router from 'vue-router';
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
      vSelect,
    },
    data() {
      return {
        msg: 'Welcome to Your Vue.js App',
        organizations: [],
        stockItems: [],
        stockData: {},
        oldItem: null,
        oldOrg: null,
        oldValue: null,
        selectedItem: null,
        selectedOrg: null,
        disabled: true,
        seen: false,
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
      go(path) {
        return (() => {
          Router.push({ name: path });
        });
      },
      setOrg(val) {
        this.selectedOrg = val.id;
      },
      setStockItem(val) {
        this.selectedItem = val.id;
      },
      itemClick(node) {
        console.log(`${node.model.text} clicked !`);
        this.selectedOrg = node.model.id;
      },
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
            '#3F51B5',
            '#F44336',
            '#4CAF50',
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
          console.log(response.body);
          response.body.organisationUnits.forEach((elem) => {
            Vue.set(elem, 'children', []);
            this.data.push(elem);
            this.recurseHierarchyv2(elem.id, elem.children);
          });
        });
      },
      recurseHierarchy(elemId, childBox) {
        this.$http.get(`https://inf5750.dhis2.org/training/api/26/organisationUnits/${elemId}?includeChildren&fields=displayName~rename(text),id&paging=false`, {
          headers: {
            Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
          },
        }).then((response) => {
          for (let i = 1; i < response.body.organisationUnits.length; i += 1) {
            console.log(response.body.organisationUnits[i]);
            Vue.set(response.body.organisationUnits[i], 'children', []);
            childBox.push(response.body.organisationUnits[i]);
            this.recurseHierarchyv2(response.body.organisationUnits[i].id,
              response.body.organisationUnits[i].children);
          }
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

  .tree-box {
    position: absolute;
    background-color: white;
    width: 750px;
    z-index: 99;
    height: 500px;
    overflow-y: scroll;
  }


  .orgSel {
    width: 80%;
  }

  .topsel {
    width: 250px;
  }

  .topbar {
    display: flex;
    justify-content: space-around;
    margin-bottom: 35px;
  }

  .topbar .dropdown {
    width: 350px;
    height: 36px;
  }

  .v-select .dropdown-toggle {
    height: 36px;
  }

  .menu {
    width: 50%;
    margin: 0 auto;
    min-width: 800px;
  }

  .box-sel {
    height: 36px;
    width: 90%;
    background-color: white;
    border-radius: 4px;
  }

  .box-sel .selected-tag {
    overflow: hidden;
  }

  .box-sel.open {
    width: 250%;
    margin-left: calc(150% + 20px);
  }

  #menu div {
    border: 1px solid #3F51B5;
    border-radius: 5px;
    width: 100px;
    height: 30px;
    line-height: 30px;
    display: inline-block;
    margin: 0 20px;
  }

  #menu a {
    width: 100%;
    height: 100%;
    text-decoration: none;
    color: #3F51B5;
  }

  #menu .sel {
    color: white;
    background-color: #3F51B5;
  }
</style>
