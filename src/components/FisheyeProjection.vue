<template>
<canvas id="webgl-canvas"></canvas>
</template>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang="sass" scoped>
#webgl-canvas
  width: 100vw
  height: 400px
  display: block

table p
  margin: 0
</style>


<script>
/* eslint-disable camelcase, max-len */

/**
 * Based on http://webglfundamentals.org/webgl/lessons/webgl-2-textures.html
 */

import forEach from 'lodash/forEach';

import { loadShader, createProgram, resizeCanvasToDisplaySize } from '../scripts/webgl-utils-remix';

import Vec3 from '../scripts/Vec3';

import fragmentShaderSource from '../shaders/standard.frag';
import vertexShaderSource from '../shaders/standard.vert';


let v2Last = new Vec3(1, 1, 1);
function getReferenceSystem(vt) {
  const v1 = vt.normalize();
  const v3 = vt.cross(v2Last).normalize();
  const v2 = v3.cross(v1).normalize();

  v2Last = v2;

  return { v1, v2, v3 };
}

function initializeCubemap(gl, program) {
  const cubeMapTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTexture);

  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  const u_cubeMapLocation = gl.getUniformLocation(program, 'u_cubeMap');
  gl.uniform1i(u_cubeMapLocation, 0);
}

function initializePositionAttribute(gl, program) {
  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 2;          // 2 components per iteration
  const type = gl.FLOAT;   // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0;        // start at the beginning of the buffer

  // Create a buffer to put 2d clip space points in
  const positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Set a rectangle the same size as the image.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
  ]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  // Turn on the position attribute
  gl.enableVertexAttribArray(positionLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Configure the atribute pointer.
  gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
}

function initializeGpu(gl, faces) {
  const fs = loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  const vs = loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER);

  const program = createProgram(gl, [vs, fs]);
  gl.useProgram(program);

  initializeCubemap(gl, program, faces);
  initializePositionAttribute(gl, program);


  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const v1Location = gl.getUniformLocation(program, 'u_v1');
  const v2Location = gl.getUniformLocation(program, 'u_v2');
  const v3Location = gl.getUniformLocation(program, 'u_v3');


  const cubeMapSides = {
    [gl.TEXTURE_CUBE_MAP_NEGATIVE_X]: faces.left,
    [gl.TEXTURE_CUBE_MAP_POSITIVE_X]: faces.right,
    [gl.TEXTURE_CUBE_MAP_NEGATIVE_Y]: faces.bottom,
    [gl.TEXTURE_CUBE_MAP_POSITIVE_Y]: faces.top,
    [gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]: faces.back,
    [gl.TEXTURE_CUBE_MAP_POSITIVE_Z]: faces.front,
  };

  return function draw(cameraDirection) {
    // Write the image data to the texture

    forEach(cubeMapSides, (image, sideCode) => {
      if (image) {
        gl.texImage2D(sideCode, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      }
    });

    // Set the reference system
    const { v1, v2, v3 } = getReferenceSystem(cameraDirection);
    gl.uniform3f(v1Location, ...v1.asArray());
    gl.uniform3f(v2Location, ...v2.asArray());
    gl.uniform3f(v3Location, ...v3.asArray());

    // Set the resolution and size
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
}

export default {
  props: ['cameraDirection', 'faces'],

  data() {
    return {
      alive: true,
    };
  },

  mounted() {
    const gl = this.$el.getContext('webgl');

    const draw = initializeGpu(gl, this.faces);

    let averagedCameraDirection = this.cameraDirection;
    const decayfactor = 0.025;

    const repeatDraw = () => {
      if (this.alive) {
        averagedCameraDirection = averagedCameraDirection
          .mult(1 - decayfactor)
          .add(this.cameraDirection.mult(decayfactor));

        draw(averagedCameraDirection);

        requestAnimationFrame(repeatDraw);
      }
    };
    requestAnimationFrame(repeatDraw);
  },

  beforeDestroy() {
    this.alive = false;
  },
};
</script>
