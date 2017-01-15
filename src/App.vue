<template>
  <div id="app">
    <graphics></graphics>
  </div>
</template>

<script>
import Graphics from './components/Graphics';

export default {
  name: 'app',
  components: {
    Graphics,
  },
};
</script>

<style>
body {
  margin: 0;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
