<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <select>
      <option v-for="program in programs" :value="program.id">{{program.displayName}}</option>
    </select>
    <line-example/>
  </div>
</template>

<script>
  import LineExample from './LineChart.jsx';

  export default {
    name: 'HelloWorld',
    components: {
      LineExample,
    },
    data() {
      return {
        msg: 'Welcome to Your Vue.js App',
        programs: [],
      };
    },
    created() {
      this.fetchPrograms();
    },
    methods: {
      fetchPrograms() {
        this.$http.get('https://play.dhis2.org/demo/api/programs.json', {
          headers: {
            Authorization: 'Basic a29rZXJpZXQ6T2JsaWcuc29sdXRpb241',
          },
        }).then((response) => {
          this.programs = response.body.programs;
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
