<template>
  <div class="hello">
    <div id="menu"><a href="#/"><div>Graph</div></a><a href="#/other"><div class="sel">Other ting</div></a></div>
    <h1>Stock Status</h1>
    <div class="menu">
      <div class="topbar">
        <div>
          <p>Usage: </p>
          <v-select :on-change="setItemUsage" label="displayName" :options="stockItems"></v-select>
        </div>
        <div>
          <p>Stock: </p>
          <v-select :on-change="setItemStock" label="displayName" :options="stockItems"></v-select>
        </div>
      </div>
      <vue-slider tooltip="hover" :disabled="disabled" :slider-style="{'background-color': '#3F51B5'}" :process-style="{'background-color': '#3F51B5'}" :tooltip-style="{'background-color': '#3F51B5', 'border': '1px solid #3F51B5'}" :min="minMaxScale.min" :max="minMaxScale.max"
                  v-model="minMax"></vue-slider>
    </div>
    <div class="status">
      <div class="status-box" v-for="(id, i) in numDivs">
        <v-select class="box-sel" :on-change="setOrg(i)" label="displayName" :options="organizations"></v-select>
        <p class="info-text">
          {{ data[id] && avgUse[id] ? Math.round(data[id].rows[0][3] / avgUse[id]) + "m" : "?" }}
        </p>
        <div class="circle"
             :class="data[id] ? ((data[id].rows[0][3] > minMax[0]) ? ((data[id].rows[0][3] < minMax[1]) ? 'color-green' : 'color-blue') : 'color-red') : 'color-white'"></div>
      </div>
      <div class="status-box" v-on:click="numDivs.push(0)">
        <span class="plus">+</span>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue';
  import vueSlider from 'vue-slider-component';
  import vSelect from 'vue-select';

  export default {
    name: 'OtherWorld',
    components: {
      vueSlider,
      vSelect,
    },
    data() {
      return {
        numDivs: [],
        organizations: [],
        stockItems: [],
        minMax: [0, 0],
        minMaxScale: { min: 0, max: 1 },
        data: {},
        avgUse: {},
        disabled: true,
        selectedItemUsage: null,
        oldSelectedItemUsage: null,
        selectedItemStock: null,
        oldSelectedItemStock: null,
      };
    },
    created() {
      this.fetchOrganizations();
      this.fetchStockItems();
    },
    updated() {
      this.getUsageData();
      this.getStockData();
    },
    methods: {
      setOrg(i) {
        return ((val) => {
          Vue.set(this.numDivs, i, val.id);
        });
      },
      setItemUsage(val) {
        this.selectedItemUsage = val;
      },
      setItemStock(val) {
        this.selectedItemStock = val;
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
      getUsageData() {
        this.numDivs.forEach((id, i) => {
          if (this.selectedItemUsage && this.numDivs[i] && this.numDivs[i] !== 0
            && !this.data[this.numDivs[i]]) {
            this.$http.get(`${Vue.config.dhis2url}/api/26/analytics?dimension=dx:${this.selectedItemUsage.id}`
              + `&dimension=pe:LAST_12_MONTHS&dimension=ou:${id}`, {
                headers: {
                  Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
                },
              }).then((response) => {
                let totalUse = 0;
                response.body.rows.forEach((month) => {
                  totalUse += parseInt(month[3], 10);
                });
                Vue.set(this.avgUse, id, totalUse / 12);
              });
          }
        });
      },
      getStockData() {
        this.numDivs.forEach((id, i) => {
          if (this.selectedItemStock && this.numDivs[i] && this.numDivs[i] !== 0
            && !this.data[this.numDivs[i]]) {
            this.$http.get(`${Vue.config.dhis2url}/api/26/analytics?dimension=dx:${this.selectedItemStock.id}`
              + `&dimension=pe:LAST_MONTH&dimension=ou:${id}`, {
                headers: {
                  Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
                },
              }).then((response) => {
                this.disabled = false;
                if (response.body.rows[0][3] * 1.25 > this.minMaxScale.max) {
                  this.minMaxScale.max = response.body.rows[0][3] * 1.25;
                }
                Vue.set(this.data, id, response.body);
              });
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

  .status {
    display: flex;
    width: 80vw;
    margin: 0 auto;
    flex-wrap: wrap;
  }

  .status-box {
    background-color: #90A4AE;
    width: 200px;
    height: 300px;
    margin: 25px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }

  .circle {
    width: 100px;
    height: 100px;
    border-radius: 100%;
  }

  .color-green {
    background-color: #4CAF50;
  }

  .color-blue {
    background-color: #3F51B5;
  }

  .color-red {
    background-color: #F44336;
  }

  .color-white {
    background-color: white;
  }

  .info-text {
    font-size: 90px;
    margin: 0;
  }

  .plus {
    font-size: 150px;
    margin: 0;
    font-weight: 700;
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
