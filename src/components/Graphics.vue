<template>
<canvas></canvas>
</template>

<script>
/* eslint-disable camelcase, max-len */

/**
 * Based on http://webglfundamentals.org/webgl/lessons/webgl-2-textures.html
 */

import { loadShader, createProgram, resizeCanvasToDisplaySize } from '../scripts/webgl-utils-remix';

import fragmentShaderSource from '../shaders/standard.frag';
import vertexShaderSource from '../shaders/standard.vert';

import topImagePath from '../assets/top.png';
import leftImagePath from '../assets/left.png';
import frontImagePath from '../assets/front.png';
import rightImagePath from '../assets/right.png';
import backImagePath from '../assets/back.png';
import bottomImagePath from '../assets/bottom.png';

function setRectangle(gl) {
  const x1 = -1;
  const x2 = 1;
  const y1 = -1;
  const y2 = 1;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2,
  ]), gl.STATIC_DRAW);
}

function loadImage(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
  });
}

function getReferenceSystem(v1t) {
  function cross(v1, v2) {
    const x1 = v1[0];
    const y1 = v1[1];
    const z1 = v1[2];
    const x2 = v2[0];
    const y2 = v2[1];
    const z2 = v2[2];

    return [
      (y1 * z2) - (z1 * y2),
      (z1 * x2) - (x1 * z2),
      (x1 * y2) - (y1 * x2),
    ];
  }

  function normalize(v) {
    const l = Math.sqrt((v[0] * v[0]) + (v[1] * v[1]) + (v[2] * v[2]));
    return v.map(a => a / l);
  }

  const v1 = normalize(v1t);
  const v2 = normalize(cross(v1, [0, 1, 0]));
  const v3 = normalize(cross(v1, v2));

  return { v1, v2, v3 };
}

function initializeGpu(gl, images) {
  const fs = loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  const vs = loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER);

  const program = createProgram(gl, [vs, fs]);
  gl.useProgram(program);

  // PROGRAM CREATED; Now for the rest

  // look up where the vertex data needs to go.
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const texcoordLocation = gl.getAttribLocation(program, 'a_texCoord');

  // Create a buffer to put three 2d clip space points in
  const positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set a rectangle the same size as the image.
  setRectangle(gl);

  // provide texture coordinates for the rectangle.
  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

  const a = -1;
  const b = 1;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    a, a,
    b, a,
    a, b,
    a, b,
    b, a,
    b, b,
  ]), gl.STATIC_DRAW);

  // create n textures
  images.forEach((image, i) => {
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // lookup the sampler location.
    const u_imageiLocation = gl.getUniformLocation(program, `u_image${i}`);

    // set which texture units to render with.
    gl.uniform1i(u_imageiLocation, i);  // texture unit i
  });


  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the position attribute
  gl.enableVertexAttribArray(positionLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 2;          // 2 components per iteration
  const type = gl.FLOAT;   // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionLocation, size, type, normalize, stride, offset);

  // Turn on the teccord attribute
  gl.enableVertexAttribArray(texcoordLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

  gl.vertexAttribPointer(
      texcoordLocation, size, type, normalize, stride, offset);

  return program;
}

function draw(gl, program, time) {
  // lookup uniforms
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

  const v1Location = gl.getUniformLocation(program, 'u_v1');
  const v2Location = gl.getUniformLocation(program, 'u_v2');
  const v3Location = gl.getUniformLocation(program, 'u_v3');

  const rs = getReferenceSystem([4 * Math.cos(time), -2, -1 * Math.sin(time)]);
  gl.uniform3f(v1Location, rs.v1[0], rs.v1[1], rs.v1[2]);
  gl.uniform3f(v2Location, rs.v2[0], rs.v2[1], rs.v2[2]);
  gl.uniform3f(v3Location, rs.v3[0], rs.v3[1], rs.v3[2]);


  resizeCanvasToDisplaySize(gl.canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // set the resolution
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

  // Draw the rectangle.
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}


export default {
  mounted() {
    const imagePaths = [
      frontImagePath,
      rightImagePath,
      bottomImagePath,
      backImagePath,
      leftImagePath,
      topImagePath,
    ];

    Promise.all(imagePaths.map(loadImage)).then((images) => {
      const gl = this.$el.getContext('webgl');

      const program = initializeGpu(gl, images);
      const repeatDraw = (time) => {
        draw(gl, program, time * 1e-3);
        requestAnimationFrame(repeatDraw);
      };
      requestAnimationFrame(repeatDraw);
    });
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
canvas {
  width: 100vw;
  height: 100vh;
  display: block;
}
</style>
