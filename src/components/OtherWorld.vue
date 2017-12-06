<template>
  <div class="hello">
    <div id="menu"><a href="#/"><div>Graph</div></a><a href="#/other"><div class="sel">Stock Status</div></a></div>
    <div class="menu">
      <div class="topbar">
        <div>
          <p>Usage: </p>
          <v-select :on-change="setItemUsage" label="displayName" :options="$root.$data.stockItems"></v-select>
          <div class="toggle" v-bind:class="{active: seen}" v-on:click="seen = !seen">Toggle Tree ▼</div>
        </div>
        <div>
          <p>Stock item: </p>
          <v-select :on-change="setItemStock" label="displayName" :options="$root.$data.stockItems"></v-select>
          <div class="things">
            <input class="numin" v-model="minMax[0]" type="number" :disabled="disabled">
            <input class="numin" v-model="minMax[1]" type="number" :disabled="disabled">
          </div>
        </div>
      </div>
      <vue-slider tooltip="hover" width="95%" class="slide" :disabled="disabled" :slider-style="{'background-color': '#3F51B5'}" :process-style="{'background-color': '#3F51B5'}" :tooltip-style="{'background-color': '#3F51B5', 'border': '1px solid #3F51B5'}" :min="minMaxScale.min" :max="minMaxScale.max"
                  v-model="minMax"></vue-slider>
      <v-jstree v-if="seen" class="tree-box" multiple :data="$root.$data.data" whole-row @item-click="itemClick"></v-jstree>
    </div>
    <div class="status">
      <div class="status-box" v-for="(obj, i) in numDivs">
        <v-select class="box-sel" :value.sync="numDivs[i]" :on-change="setOrg(i)" label="displayName" :options="$root.$data.organizations"></v-select>
        <p class="info-text">
          {{ data[obj.id] && avgUse[obj.id] ? Math.round(data[obj.id].rows[0][3] / avgUse[obj.id]) + "m" : "?" }}
        </p>
        <div class="circle"
             :class="data[obj.id] ? ((data[obj.id].rows[0][3] > minMax[0]) ? ((data[obj.id].rows[0][3] < minMax[1]) ? 'color-green' : 'color-blue') : 'color-red') : 'color-white'"></div>
        <div class="close" v-on:click="rmOrg(obj)">Close</div>
      </div>
      <div class="status-box" v-on:click="addOrg({ id: 0, displayName: 'Select' })">
        <span class="plus">+</span>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue';
  import vueSlider from 'vue-slider-component';
  import vSelect from 'vue-select';
  import VJstree from 'vue-jstree';

  export default {
    name: 'OtherWorld',
    components: {
      vueSlider,
      vSelect,
      VJstree,
    },
    data() {
      return {
        numDivs: [],
        minMax: [0, 0],
        minMaxScale: { min: 0, max: 1 },
        avgUse: {},
        data: {},
        disabled: true,
        seen: false,
        selectedItemUsage: null,
        oldSelectedItemUsage: null,
        selectedItemStock: null,
        oldSelectedItemStock: null,
      };
    },
    updated() {
      this.getUsageData();
      this.getStockData();
    },
    methods: {
      addOrg(obj) {
        this.numDivs.push(obj);
      },
      rmOrg(obj) {
        this.numDivs.splice(this.numDivs.indexOf(obj), 1);
        this.setTreeSelected(this.$root.$data.data, this.numDivs.map(o => o.id));
      },
      setOrg(i) {
        return ((val) => {
          Vue.set(this.numDivs, i, val);
          this.setTreeSelected(this.$root.$data.data, this.numDivs.map(o => o.id));
        });
      },
      setTreeSelected(data, ids) {
        if (data.length > 0) {
          data.forEach((elem) => {
            if (ids.includes(elem.id)) {
              Vue.set(elem, 'selected', true);
            } else {
              Vue.set(elem, 'selected', false);
            }
            this.setTreeSelected(elem.children, ids);
          });
        }
      },
      itemClick(node) {
        if (node.data.selected) {
          this.numDivs.push({
            id: node.model.id,
            displayName: node.model.text,
          });
        } else {
          this.numDivs.splice(this.numDivs.indexOf({
            id: node.model.id,
            displayName: node.model.text,
          }), 1);
        }
      },
      setItemUsage(val) {
        this.selectedItemUsage = val;
      },
      setItemStock(val) {
        this.selectedItemStock = val;
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

  .slide {
    margin: -45px auto 0 auto;
  }

  .things {
    width: 350px;
  }


</style>
