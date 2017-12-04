<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <select v-model="selectedItem">
      <option v-for="item in stockItems" :value="item.id">{{item.displayName}}</option>
    </select>
    <vue-slider :min="minMaxScale.min" :max="minMaxScale.max" v-model="minMax"></vue-slider>
    <div class="status">
      <div class="status-box" v-for="(id, i) in numDivs">
        <select v-model="numDivs[i]">
          <option v-for="org in organizations" :value="org.id">{{org.displayName}}</option>
        </select>
        {{ i }}
        {{ id }}
        {{ data[id] ? data[id].metaData.dimensions.dx[0] : "nope" }}
        <div class="circle"
             :class="data[id] ? ((data[id].rows[data[id].rows.length-1][3] > minMax[0]) ? ((data[id].rows[data[id].rows.length-1][3] < minMax[1]) ? 'color-green' : 'color-blue') : 'color-red') : 'color-white'"></div>
      </div>
      <div class="status-box" v-on:click="numDivs.push(0)">
        Add
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
        selectedItem: null,
        oldSelectedItem: null,
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
        if (this.oldSelectedItem !== this.selectedItem) {
          this.minMaxScale.max = 0;
        }
        this.numDivs.forEach((id, i) => {
          if (this.selectedItem && this.numDivs[i] && this.numDivs[i] !== 0
            && (!this.data[this.numDivs[i]] || this.oldSelectedItem !== this.selectedItem)) {
            this.$http.get(`https://inf5750.dhis2.org/training/api/26/analytics?dimension=dx:${this.selectedItem}`
              + `&dimension=pe:LAST_12_MONTHS&dimension=ou:${id}`, {
                headers: {
                  Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
                },
              }).then((response) => {
                response.body.rows.sort((a, b) => {
                  if (a[1] === b[1]) {
                    return 0;
                  }
                  return (a[1] < b[1]) ? -1 : 1;
                });
                if (response.body.rows[response.body.rows.length - 1][3] * 1.25
                  > this.minMaxScale.max) {
                  this.minMaxScale.max = response.body.rows[response.body.rows.length - 1][3] * 2;
                }
                Vue.set(this.data, id, response.body);
              });
          }
        });
        this.oldSelectedItem = this.selectedItem;
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
    background-color: gray;
    width: 200px;
    height: 300px;
    margin: 25px;
  }

  .circle {
    width: 100px;
    height: 100px;
    border-radius: 100%;
  }

  .color-green {
    background-color: green;
  }

  .color-blue {
    background-color: blue;
  }

  .color-red {
    background-color: red;
  }

  .color-white {
    background-color: white;
  }
</style>
