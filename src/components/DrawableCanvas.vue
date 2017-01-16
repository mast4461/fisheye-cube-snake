<template>
<canvas
  @pointerdown="active = true"
  @pointerup="active = false"
  @pointermove="drawIfActive"
  :width="size"
  :height="size"
  :style="canvasStyle"
></canvas>
</template>

<style lang="sass" scoped>
canvas
  border: 1px solid black
  cursor: crosshair
</style>

<script>
export default {
  data() {
    return {
      active: false,
      size: 128,
      multiplier: 1,
      ctx: null,
    };
  },

  props: ['name'],

  methods: {
    drawIfActive(event) {
      if (this.active) {
        const x = event.layerX;
        const y = event.layerY;
        this.drawSpot(x, y);
      }
    },

    drawSpot(x, y) {
      const l = 10;
      const o = l / 2;
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(x - o, y - o, l, l);
    },

    drawText(text, x, y) {
      this.ctx.fillStyle = 'red';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.font = `${this.size / 3}px serif`;
      this.ctx.fillText(text, x, y);
    },

    drawLine(x1, y1, x2, y2) {
      this.ctx.strokeStyle = '#ccc';

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.closePath();
      this.ctx.stroke();
    },

    drawGrid(n) {
      for (let i = 0; i <= n; i += 1) {
        const v = (i / n) * this.size;
        this.drawLine(0, v, this.size, v);
        this.drawLine(v, 0, v, this.size);
      }
    },
  },

  computed: {
    canvasStyle() {
      const v = `${this.size * this.multiplier}px`;
      return {
        width: v,
        height: v,
      };
    },
  },

  mounted() {
    this.ctx = this.$el.getContext('2d');

    this.drawGrid(15);

    const s = this.size / 2;
    this.drawText(this.name, s, s);
  },
};
</script>