<template>
<div id="app">
  <label for="paused">paused</label>
  <input type="checkbox" name="paused" v-model="paused">

  <br>
  <label for="side-length">side-length</label>
  <input type="range" name="side-length" min="1" max="10" step="1" v-model.number="sideLength">
  <span>{{sideLength}}</span>

  <br>
  <label for="zoom">zoom</label>
  <input type="range" name="zoom" min="0" max="2" step="0.0001" v-model.number="zoom">
  <span>{{zoom}}</span>

  <!-- <button @click="start">start/restart</button> -->
  <game ref="game" :side-length="sideLength" :zoom="zoom"></game>
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
      zoom: 0,
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
