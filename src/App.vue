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
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
