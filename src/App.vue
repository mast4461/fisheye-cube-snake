<template>
  <div id="app">
    <!-- <button @click="start">start/restart</button> -->
    <game ref="game" :side-length="sideLength"></game>
  </div>
</template>

<script>
import Game from './components/Game';

export default {
  name: 'app',
  components: {
    Game,
  },

  data() {
    return {
      sideLength: 4,
    };
  },

  methods: {
    listenForKeys(event) {
      switch (event.keyCode) {
        case 39:
          return this.$refs.game.turnRight();
        case 37:
          return this.$refs.game.turnLeft();
        default:
          return undefined;
      }
    },
  },

  mounted() {
    this.$refs.game.tick();
    this.tickerId = setInterval(() => {
      this.$refs.game.tick();
    }, 250);
    document.addEventListener('keydown', this.listenForKeys);
  },

  beforeDestroy() {
    clearInterval(this.tickerId);
    document.removeEventListener('keydown', this.listenForKeys);
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
