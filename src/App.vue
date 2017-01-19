<template>
<div id="app">
  <input type="checkbox" name="paused" v-model="paused">
  <label for="paused">paused</label>
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
      sideLength: 3,
      paused: false,

      keyPressHandlers: {
        // Right arrow
        39: () => this.$refs.game.turnRight(),

        // Left arrow
        37: () => this.$refs.game.turnLeft(),

        // Space
        32: () => { this.paused = !this.paused; },
      },
    };
  },

  methods: {
    keyPressHandler(event) {
      const func = this.keyPressHandlers[event.keyCode];

      if (func) {
        func();
        event.preventDefault();
      }
    },

    tick() {
      if (!this.paused) {
        this.$refs.game.tick();
      }
    },
  },

  mounted() {
    this.$refs.game.tick();
    this.tickerId = setInterval(() => this.tick(), 250);
    document.addEventListener('keydown', this.keyPressHandler);
  },

  beforeDestroy() {
    clearInterval(this.tickerId);
    document.removeEventListener('keydown', this.keyPressHandler);
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
