<template>
<div>
  <canvas id="webgl-canvas" ref="webgl-canvas"></canvas>

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

import { loadShader, createProgram, resizeCanvasToDisplaySize } from '../scripts/webgl-utils-remix';

import Vec3 from '../scripts/Vec3';

import DrawableCanvas from './DrawableCanvas';

import fragmentShaderSource from '../shaders/standard.frag';
import vertexShaderSource from '../shaders/standard.vert';


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

let v2Last = new Vec3(1, 1, 1);
function getReferenceSystem(vt) {
  const v1 = vt.normalize();
  const v3 = vt.cross(v2Last).normalize();
  const v2 = v3.cross(v1).normalize();

  v2Last = v2;

  return { v1, v2, v3 };
}

function initializeGpu(gl) {
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

  // START CUBEMAP
  const cubeMapTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTexture);

  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  const u_cubeMapLocation = gl.getUniformLocation(program, 'u_cubeMap');
  gl.uniform1i(u_cubeMapLocation, 0);
  // END CUBEMAP

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

function draw(gl, program, time, cubeMapSides, cameraDirection) {
  cubeMapSides.forEach(([side, image]) => {
    gl.texImage2D(side, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  });

  // lookup uniforms
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

  const v1Location = gl.getUniformLocation(program, 'u_v1');
  const v2Location = gl.getUniformLocation(program, 'u_v2');
  const v3Location = gl.getUniformLocation(program, 'u_v3');

  const rs = getReferenceSystem(cameraDirection);
  gl.uniform3f(v1Location, rs.v1.x, rs.v1.y, rs.v1.z);
  gl.uniform3f(v2Location, rs.v2.x, rs.v2.y, rs.v2.z);
  gl.uniform3f(v3Location, rs.v3.x, rs.v3.y, rs.v3.z);

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
  components: {
    DrawableCanvas,
  },

  props: ['cameraDirection', 'sideLength', 'headInfo'],

  mounted() {
    const gl = this.$refs['webgl-canvas'].getContext('webgl');

    const cubeMapSides = [
      [gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 'left'],
      [gl.TEXTURE_CUBE_MAP_POSITIVE_X, 'right'],
      [gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 'bottom'],
      [gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 'top'],
      [gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 'back'],
      [gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 'front'],
    ];

    const program = initializeGpu(gl);
    const loadedCubeMapSides = cubeMapSides.map(([side, ref]) => [side, this.$refs[ref].$el]);

    const dcs = [ // Temporary!!!
      'left',
      'right',
      'bottom',
      'top',
      'back',
      'front',
    ].map(v => this.$refs[v]);

    const repeatDraw = (time) => {
      dcs.forEach(dc => dc.reset());
      this.$refs[this.headInfo.face].fillCell(...this.headInfo.position);


      draw(gl, program, time * 4e-4, loadedCubeMapSides, this.cameraDirection);
      requestAnimationFrame(repeatDraw);
    };
    requestAnimationFrame(repeatDraw);
  },
};
</script>
