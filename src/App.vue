<template>
  <div id="app">
    <!-- <button @click="start">start/restart</button> -->
    <graphics :camera-direction="cameraDirection" :side-length="sideLength" :head-info="headInfo"></graphics>
  </div>
</template>

<script>
import Graphics from './components/Graphics';
import Game from './scripts/game-logic';

export default {
  name: 'app',
  components: {
    Graphics,
  },

  data() {
    return {
      game: null,
      tickerId: null,
      cameraDirection: [1, 0, 0],
      headInfo: { face: 'front', position: [0, 0] },
      sideLength: 4,
    };
  },

  methods: {
    listenForKeys(event) {
      switch (event.keyCode) {
        case 39:
          return this.game.turnRight();
        case 37:
          return this.game.turnLeft();
        default:
          return undefined;
      }
    },
  },

  mounted() {
    this.game = new Game(this.sideLength);
    this.game.tick();
    this.tickerId = setInterval(() => {
      this.game.tick();

      this.cameraDirection = this.game.getCameraDirection().asArray();
      this.headInfo = this.game.getHeadInfo();
    }, 100);
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
