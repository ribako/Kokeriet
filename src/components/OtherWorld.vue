<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div class="menu"><div class="topbar"><div><p>Usage: </p><select class="topsel" v-model="selectedItemUsage">
      <option v-for="item in stockItems" :value="item.id">{{item.displayName}}</option>
    </select></div>
    <div><p>Stock: </p><select class="topsel" v-model="selectedItemStock">
      <option v-for="item in stockItems" :value="item.id">{{item.displayName}}</option>
    </select></div></div>
    <vue-slider :bg-style="{color: '#9C27B0'}" :min="minMaxScale.min" :max="minMaxScale.max" v-model="minMax"></vue-slider></div>
    <div class="status">
      <div class="status-box" v-for="(id, i) in numDivs">
        <select class="orgSel" v-model="numDivs[i]">
          <option v-for="org in organizations" :value="org.id">{{org.displayName}}</option>
        </select>
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

  export default {
    name: 'OtherWorld',
    components: {
      vueSlider,
    },
    data() {
      return {
        msg: 'Welcome to Your Other Vue.js App',
        numDivs: [],
        organizations: [],
        stockItems: [],
        minMax: [0, 0],
        minMaxScale: { min: 0, max: 1 },
        data: {},
        avgUse: {},
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
      getUsageData() {
        this.numDivs.forEach((id, i) => {
          if (this.selectedItemUsage && this.numDivs[i] && this.numDivs[i] !== 0
            && !this.data[this.numDivs[i]]) {
            this.$http.get(`https://inf5750.dhis2.org/training/api/26/analytics?dimension=dx:${this.selectedItemUsage}`
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
            this.$http.get(`https://inf5750.dhis2.org/training/api/26/analytics?dimension=dx:${this.selectedItemStock}`
              + `&dimension=pe:LAST_MONTH&dimension=ou:${id}`, {
                headers: {
                  Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
                },
              }).then((response) => {
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

  .menu {
    width: 50%;
    margin: 0 auto;
    min-width: 800px;
  }
</style>
