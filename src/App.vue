<template>
  <div id="app">
    <div id="menu"><a href="#/">Graph</a> - <a href="#/other">Other ting</a></div>
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'app',
  };
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
