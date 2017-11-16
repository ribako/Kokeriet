<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <select v-model="selectedItem">
      <option v-for="item in stockItems" :value="item.id">{{item.displayName}}</option>
    </select>
    <div class="status">
      <div class="status-box" v-for="(id, i) in numDivs">
        <select v-model="numDivs[i]">
          <option v-for="org in organizations" :value="org.id">{{org.displayName}}</option>
        </select>
        {{ i }}
        {{ id }}
        {{ data[id] ? data[id].metaData.dimensions.dx[0] : "nope" }}
      </div>
      <div class="status-box" v-on:click="numDivs.push(0)">
        Add
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'OtherWorld',
    data() {
      return {
        msg: 'Welcome to Your Other Vue.js App',
        numDivs: [],
        organizations: [],
        stockItems: [],
        data: {},
        selectedItem: null,
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
        this.numDivs.forEach((id, i) => {
          if (this.selectedItem && this.numDivs[i] && this.numDivs[i] !== 0) {
            this.$http.get(`https://inf5750.dhis2.org/training/api/26/analytics?dimension=dx:${this.selectedItem}`
              + `&dimension=pe:LAST_12_MONTHS&dimension=ou:${this.numDivs[i]}`, {
                headers: {
                  Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
                },
              }).then((response) => {
                this.data[id] = response.body;
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
    background-color: gray;
    width: 200px;
    height: 300px;
    margin: 25px;
  }
</style>
