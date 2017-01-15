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

import leafImagePath from '../assets/leaves.jpg';
import starImagePath from '../assets/star.jpg';
import prodImagePath from '../assets/product.png';

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

function main(gl, images) {
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
  const textures = [];
  for (let ii = 0; ii < images.length; ii += 1) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[ii]);

    // add the texture to the array of textures.
    textures.push(texture);
  }

  // lookup uniforms
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

  // lookup the sampler locations.
  const u_image0Location = gl.getUniformLocation(program, 'u_image0');
  const u_image1Location = gl.getUniformLocation(program, 'u_image1');
  const u_image2Location = gl.getUniformLocation(program, 'u_image2');

  resizeCanvasToDisplaySize(gl.canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

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

  // set the resolution
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

  // set which texture units to render with.
  gl.uniform1i(u_image0Location, 0);  // texture unit 0
  gl.uniform1i(u_image1Location, 1);  // texture unit 1
  gl.uniform1i(u_image2Location, 2);  // texture unit 2

  // Set each texture unit to use a particular texture.
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[0]);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textures[1]);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, textures[2]);

  // Draw the rectangle.
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export default {
  mounted() {
    const imagePaths = [leafImagePath, starImagePath, prodImagePath];
    Promise.all(imagePaths.map(loadImage)).then((images) => {
      const gl = this.$el.getContext('webgl');
      main(gl, images);
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
