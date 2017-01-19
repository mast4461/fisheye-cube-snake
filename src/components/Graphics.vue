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

function initializeGpu(gl) {
  const fs = loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  const vs = loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER);

  const program = createProgram(gl, [vs, fs]);
  gl.useProgram(program);

  initializeCubemap(gl, program);
  initializePositionAttribute(gl, program);


  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const v1Location = gl.getUniformLocation(program, 'u_v1');
  const v2Location = gl.getUniformLocation(program, 'u_v2');
  const v3Location = gl.getUniformLocation(program, 'u_v3');

  return function draw(time, cubeMapSides, cameraDirection) {
    // Write the image data to the texture
    cubeMapSides.forEach(([side, image]) => {
      gl.texImage2D(side, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
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
  components: {
    DrawableCanvas,
  },

  props: ['cameraDirection', 'sideLength', 'headInfo', 'snakeCells'],

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

    const draw = initializeGpu(gl);
    const loadedCubeMapSides = cubeMapSides.map(([side, ref]) => [side, this.$refs[ref].$el]);

    const dcs = [ // Temporary!!!
      'top',
      'left',
      'front',
      'right',
      'back',
      'bottom',
    ].map(v => this.$refs[v]);

    let averagedCameraDirection = this.cameraDirection;
    const decayfactor = 0.025;

    const repeatDraw = (time) => {
      dcs.forEach(dc => dc.reset());
      this.$refs[this.headInfo.face].fillCell(...this.headInfo.position, 'blue');
      this.snakeCells.forEach((cell) => {
        dcs[cell.faceIndex].fillCell(...cell.projectedPosition.asArray(), 'black', cell.type);
      });

      averagedCameraDirection = averagedCameraDirection.mult(1 - decayfactor).add(this.cameraDirection.mult(decayfactor));

      draw(time * 4e-4, loadedCubeMapSides, averagedCameraDirection);
      requestAnimationFrame(repeatDraw);
    };
    requestAnimationFrame(repeatDraw);
  },
};
</script>
