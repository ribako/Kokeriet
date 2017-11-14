<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <select>
      <option v-for="organization in organizations" :value="organization.id">{{organization.displayName}}</option>
    </select>
    <line-example/>
  </div>
</template>

<script>
  import LineExample from './LineChart.jsx';

  /* const username = 'student';
  const password = 'INF5750!';
  const buf = new Buffer(`${username}:${password}`.toString('base64'));
  const auth = `Basic ${buf}`; */

  export default {
    name: 'HelloWorld',
    components: {
      LineExample,
    },
    data() {
      return {
        msg: 'Welcome to Your Vue.js App',
        programs: [],
        organizations: [],
      };
    },
    created() {
      this.fetchOrganizations();
    },
    methods: {
      fetchOrganizations() {
        this.$http.get('https://inf5750.dhis2.org/demo/api/organisationUnits?paging=false', {
          headers: {
            Authorization: 'Basic c3R1ZGVudDpJTkY1NzUwIQ==',
          },
        }).then((response) => {
          this.organizations = response.body.organisationUnits;
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
