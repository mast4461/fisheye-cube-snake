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
      this.lineWidth = this.step / 10;

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      // this.ctx.closePath();
      this.ctx.stroke();
    },

    drawMultiline(vec2s) {
      if (vec2s.length < 1) {
        return;
      }

      this.ctx.beginPath();

      this.ctx.moveTo(
        (vec2s[0].x * this.step) + this.halfStep,
        (vec2s[0].y * this.step) + this.halfStep
      );
      for (let i = 1; i < vec2s.length; i += 1) {
        this.ctx.lineTo(
          (vec2s[i].x * this.step) + this.halfStep,
          (vec2s[i].y * this.step) + this.halfStep
        );
      }

      // this.ctx.closePath();
      this.ctx.stroke();
    },

    drawSnake(vec2s) {
      this.ctx.save();

      this.ctx.strokeStyle = '#222';
      this.ctx.lineWidth = this.halfStep;
      this.ctx.lineJoin = 'round';
      this.drawMultiline(vec2s);

      this.ctx.strokeStyle = '#ddd';
      this.ctx.lineWidth = this.halfStep * 0.5;
      this.ctx.setLineDash([this.halfStep * 0.2]);
      this.drawMultiline(vec2s);

      this.ctx.restore();
    },

    drawGrid() {
      this.ctx.lineWidth = this.step / 20;
      const color = 'rgba(0, 0, 0, 0.4)';
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
      this.ctx.fillStyle = color;

      const a = x * this.step;
      const b = y * this.step;
      this.ctx.fillRect(a, b, this.step, this.step);

      const lineColor = 'blue';
      switch (type) {
        case 0: {
          const a0 = a + this.halfStep;
          this.drawLine(a0, b, a0, b + this.step, lineColor);
          break;
        }
        case 1: {
          const b0 = b + this.halfStep;
          this.drawLine(a, b0, a + this.step, b0, lineColor);
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

    canvas() {
      return this.$el;
    },

    step() {
      return this.size / this.sideLength;
    },

    halfStep() {
      return this.step / 2;
    },
  },

  mounted() {
    this.ctx = this.$el.getContext('2d');

    this.reset();
  },
};
</script>