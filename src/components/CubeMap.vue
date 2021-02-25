<template>
<div>
  <table>
    <tr>
      <td></td>
      <td>
        <p>top</p>
        <drawable-canvas ref="top" name="top" :side-length="sideLength" color="rgb(254, 161, 11)"></drawable-canvas>
      </td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>
        <p>left</p>
        <drawable-canvas ref="left" name="left" :side-length="sideLength" color="rgb(135, 65, 44)"></drawable-canvas>
      </td>
      <td>
        <p>front</p>
        <drawable-canvas ref="front" name="front" :side-length="sideLength" color="rgb(4, 71, 29)"></drawable-canvas>
      </td>
      <td>
        <p>right</p>
        <drawable-canvas ref="right" name="right" :side-length="sideLength" color="rgb(223, 37, 14)"></drawable-canvas>
      </td>
      <td>
        <p>back</p>
        <drawable-canvas ref="back" name="back" :side-length="sideLength" color="rgb(156, 39, 144)"></drawable-canvas>
      </td>
    </tr>
    <tr>
      <td></td>
      <td>
        <p>bottom</p>
        <drawable-canvas ref="bottom" name="bottom" :side-length="sideLength" color="rgb(114, 187, 183)"></drawable-canvas>
      </td>
      <td></td>
      <td></td>
    </tr>
  </table>

</div>
</template>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
#webgl-canvas {
  width: 100vw;
  height: 400px;
  display: block;
}
table p {
  margin: 0;
}
</style>

<script>
import DrawableCanvas from './DrawableCanvas';

export default {
  components: {
    DrawableCanvas,
  },

  props: ['sideLength', 'snakeCells'],

  computed: {
    faces() {
      return {
        top: this.$refs.top.canvas,
        left: this.$refs.left.canvas,
        front: this.$refs.front.canvas,
        right: this.$refs.right.canvas,
        back: this.$refs.back.canvas,
        bottom: this.$refs.bottom.canvas,
      };
    },

    drawableCanvases() {
      return [
        this.$refs.top,
        this.$refs.left,
        this.$refs.front,
        this.$refs.right,
        this.$refs.back,
        this.$refs.bottom,
      ];
    },
  },

  methods: {
    draw() {
      this.drawableCanvases.forEach(dc => dc.reset());
      // this.snakeCells.forEach((cell) => {
      //   this.drawableCanvases[cell.faceIndex]
      //     .fillCell(...cell.projectedPosition.asArray(), 'black', cell.type);
      // });

      [0, 1, 2, 3, 4, 5].forEach((faceIndex) => {
        const cells = this.snakeCells.filter(cell => cell.faceIndex === faceIndex);
        if (cells.length < 1) {
          return;
        }

        const face = cells[0].face;
        const pps = this.snakeCells
          .filter(cell => cell.position.sub(face.oLogic).dot(face.normal) < 1.5)
          .map(cell => face.project(cell.position));
        const drawableCanvas = this.drawableCanvases[faceIndex];

        // cells.forEach((cell) => {
        //   drawableCanvas.fillCell(...cell.projectedPosition.asArray(), 'black', cell.type);
        // });

        // console.log(pps);
        drawableCanvas.drawSnake(pps);
      });
    },
  },
};

</script>