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

  props: ['name', 'color', 'sideLength'],

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
      this.ctx.fillStyle = 'green';
      this.ctx.fillRect(x - o, y - o, l, l);
    },

    drawText(text, x, y) {
      this.ctx.fillStyle = 'black';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.font = `${this.size / 3}px serif`;
      this.ctx.fillText(text, x, y);
    },

    drawLine(x1, y1, x2, y2, color = '#ccc') {
      this.ctx.strokeStyle = color;

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.closePath();
      this.ctx.stroke();
    },

    drawGrid() {
      const color = 'rgba(0, 0, 0, 0.1)';
      for (let i = 0; i <= this.sideLength; i += 1) {
        const v = (i / this.sideLength) * this.size;
        this.drawLine(0, v, this.size, v, color);
        this.drawLine(v, 0, v, this.size, color);
      }
    },

    drawCenter() {
      const v = this.size / 2;
      const l = 5;
      const o = l / 2;
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(v - o, v - o, l, l);
    },

    drawRandomBackground() {
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(0, 0, this.size, this.size);
    },

    fillCell(x, y, color = 'black', type) {
      const step = this.size / this.sideLength;
      const halfStep = step / 2;
      this.ctx.fillStyle = color;

      const a = x * step;
      const b = y * step;
      this.ctx.fillRect(a, b, step, step);

      const lineColor = 'blue';
      switch (type) {
        case 0: {
          const a0 = a + halfStep;
          this.drawLine(a0, b, a0, b + step, lineColor);
          break;
        }
        case 1: {
          const b0 = b + halfStep;
          this.drawLine(a, b0, a + step, b0, lineColor);
          break;
        }
        default: {
          break;
        }
      }
    },

    checker() {
      for (let y = 0; y < this.sideLength; y += 1) {
        for (let x = y % 2; x < this.sideLength; x += 2) {
          this.fillCell(x, y, 'rgba(0, 0, 0, 0.1)');
        }
      }
    },

    reset() {
      this.drawRandomBackground();
      this.drawGrid();
      // this.checker();

      const s = this.size / 2;
      this.drawText(this.name, s, s);

      this.drawCenter();
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

    this.reset();
  },
};
</script>