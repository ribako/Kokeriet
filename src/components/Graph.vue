<template>
  <div class="hello">
    <div id="menu"><a href="#/"><div class="sel">Graph</div></a><a href="#/status"><div>Stock Status</div></a></div>
    <div class="menu">
      <div class="topbar">
        <div>
          <p>Organization: </p>
          <v-select :on-change="setOrg" :value.sync="selectedOrg" label="displayName" :options="$root.$data.organizations"></v-select>
          <div class="toggle" v-bind:class="{active: seen}" v-on:click="seen = !seen">Toggle Tree ▼</div>
        </div>
        <div>
          <p>Stock item: </p>
          <v-select :on-change="setStockItem" label="displayName" :options="$root.$data.stockItems"></v-select>
          <div class="things">
            <input class="numin" v-bind:class="{small: $root.$data.admin}" v-model="value[0]" type="number" :disabled="disabled">
            <input class="numin" v-bind:class="{small: $root.$data.admin}" v-model="value[1]" type="number" :disabled="disabled">
            <div class="admin" v-if="$root.$data.admin" v-on:click="postAdminThreshold(this)">Set default</div>
          </div>
        </div>
      </div>
      <vue-slider width="95%" tooltip="hover" class="slide" :slider-style="{'background-color': '#3F51B5'}" :process-style="{'background-color': '#3F51B5'}" :tooltip-style="{'background-color': '#3F51B5', 'border': '1px solid #3F51B5'}" v-model="value" :min="min" :max="max" :disabled="disabled"></vue-slider>
      <v-jstree v-if="seen" class="tree-box" :data="$root.$data.data" whole-row @item-click="itemClick"></v-jstree>
    </div>
    <line-chart id="gE" ref="graphElem" :chart-data="datacollection" :options="charOptions"></line-chart>
  </div>
</template>

<script>
  import Vue from 'vue';
  import lodash from 'lodash';
  import VueLodash from 'vue-lodash';
  import VJstree from 'vue-jstree';
  import vueSlider from 'vue-slider-component';
  import vSelect from 'vue-select';
  import LineChart from './LineChart.jsx';

  Vue.use(VueLodash, lodash);

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
      return baseColor;
    }
  }


  export default {
    name: 'Graph',
    components: {
      LineChart,
      vueSlider,
      VJstree,
      vSelect,
    },
    data() {
      return {
        stockData: {},
        oldItem: null,
        oldOrg: null,
        selectedItem: null,
        selectedOrg: null,
        disabled: true,
        seen: false,
        min: 0,
        max: 100,
        value: [
          0,
          0,
        ],
        oldValue: [
          0,
          0,
        ],
        datacollection: {},
        charOptions: {
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
            display: false,
          },
          responsive: true,
          maintainAspectRatio: false,
        },
      };
    },
    created() {
      this.setTreeSelected(this.$root.$data.data, null);
    },
    updated() {
      this.getDataForGraph();
      this.updateMinMax();
      this.postThreshold(this);
    },
    methods: {
      setOrg(val) {
        this.selectedOrg = val;
        this.setTreeSelected(this.$root.$data.data, val.id);
      },
      setStockItem(val) {
        this.selectedItem = val.id;
        this.getDataForGraph();
      },
      setTreeSelected(data, id) {
        data.forEach((elem) => {
          if (elem.id === id) {
            Vue.set(elem, 'selected', true);
          } else {
            Vue.set(elem, 'selected', false);
          }
          this.setTreeSelected(elem.children, id);
        });
      },
      itemClick(node) {
        this.selectedOrg = {
          id: node.model.id,
          displayName: node.model.text,
        };
        this.seen = !this.seen;
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
          this.$http.get(`${Vue.config.dhis2url}/api/26/analytics?dimension=dx:${this.selectedItem}`
            + `&dimension=pe:LAST_12_MONTHS&dimension=ou:${this.selectedOrg.id}`, {
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
              this.fetchThreshold();
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
          chartInstance.chart.config.data.datasets[0].borderColor = calculateGradientFill(
            node,
            chartInstance.scales['y-axis-0'],
            chartInstance.chart.height,
            '#3F51B5',
            '#F44336',
            '#4CAF50',
            this.value[1],
            this.value[0],
          );
        }
      },
      postThreshold: lodash.debounce((v) => {
        if (v.value !== v.oldValue && v.selectedOrg && v.selectedItem) {
          v.$http.put(`${Vue.config.dhis2url}/api/userDataStore/Kokeriet/${v.selectedOrg.id}${v.selectedItem}`, {
            min: v.value[0],
            max: v.value[1],
          }, {
            headers: {
              Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
              ContentType: 'application/json',
            },
          }).then(() => {
            Vue.set(v, 'oldValue', v.value);
          }, (response) => {
            if (response.status === 404) { // in case there is no previous entry
              v.$http.post(`${Vue.config.dhis2url}/api/userDataStore/Kokeriet/${v.selectedOrg.id}${v.selectedItem}`, {
                min: v.value[0],
                max: v.value[1],
              }, {
                headers: {
                  Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
                  ContentType: 'application/json',
                },
              }).then(() => {
                Vue.set(v, 'oldValue', v.value);
              });
            }
          });
        }
      }, 2000),
      fetchThreshold() {
        if (this.selectedOrg && this.selectedItem) {
          this.$http.get(`${Vue.config.dhis2url}/api/userDataStore/Kokeriet/${this.selectedOrg.id}${this.selectedItem}`, {
            headers: {
              Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
            },
          }).then((response) => {
            Vue.set(this, 'value', [response.body.min, response.body.max]);
            Vue.set(this, 'oldValue', [response.body.min, response.body.max]);
            this.updateMinMax();
          }, (response) => {
            if (response.status === 404) {
              this.$http.get(`${Vue.config.dhis2url}/api/dataStore/Kokeriet/${this.selectedOrg.id}${this.selectedItem}`, {
                headers: {
                  Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
                },
              }).then((response2) => {
                Vue.set(this, 'value', [response2.body.min, response2.body.max]);
                Vue.set(this, 'oldValue', [response2.body.min, response2.body.max]);
                this.updateMinMax();
              });
            }
          });
        }
      },
      postAdminThreshold() {
        if (this.selectedOrg && this.selectedItem) {
          this.$http.put(`${Vue.config.dhis2url}/api/dataStore/Kokeriet/${this.selectedOrg.id}${this.selectedItem}`, {
            min: this.value[0],
            max: this.value[1],
          }, {
            headers: {
              Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
              ContentType: 'application/json',
            },
          }).then(null, (response) => {
            if (response.status === 404) { // in case there is no previous entry
              this.$http.post(`${Vue.config.dhis2url}/api/dataStore/Kokeriet/${this.selectedOrg.id}${this.selectedItem}`, {
                min: this.value[0],
                max: this.value[1],
              }, {
                headers: {
                  Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
                  ContentType: 'application/json',
                },
              });
            }
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

  .tree-box {
    position: absolute;
    background-color: white;
    width: 750px;
    z-index: 99;
    height: 500px;
    overflow-y: scroll;
    margin-top: -20px;
    margin-left: 20px;
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
    width: 120px;
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

  .toggle {
    border: 1px solid #3F51B5;
    border-radius: 5px;
    width: 350px;
    height: 32px;
    line-height: 30px;
    display: inline-block;
    margin: 25.25px 0 0 0;
    color: #3F51B5;
    cursor: pointer;
  }

  .toggle.active {
    color: white;
    background-color: #3F51B5;
  }

  .numin {
    width: calc(50% - 4px);
    padding: 12px 20px;
    margin: 25px 0;
    display: inline-block;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    height: 35px;
  }

  .small {
    width: calc(25% - 2px) !important;
  }

  .admin {
    display: inline-block;
    height: 32px;
    line-height: 30px;
    width: calc(50% - 9px);
    border: 1px solid #3F51B5;
    color: #3F51B5;
    border-radius: 5px;
    cursor: pointer;
  }

  .slide {
    margin: -45px auto 0 auto;
  }

  .things {
    width: 350px;
  }
</style>
