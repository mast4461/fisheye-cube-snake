<template>
<div>
  <cube-map
    ref="cubeMap"
    :side-length="sideLength"
    :snake-cells="snakeCells"
  ></cube-map>

  <fisheye-projection
    v-if="isMounted"
    :camera-direction="cameraDirection"
    :faces="cubeMapFaces"
  ></fisheye-projection>
</div>
</template>

<style>

</style>

<script>
import forEach from 'lodash/forEach';

import Face from '../scripts/Face';
import Vec3 from '../scripts/Vec3';
import FisheyeProjection from './FisheyeProjection';
import CubeMap from './CubeMap';

function getFaceIndex(p, s) {
  // Coordinate system centered at corner where faces front, left and bottom meet
  if (p.z >= s) {
    return 0;
  } else if (p.x < 0) {
    return 1;
  } else if (p.y >= s) {
    return 2;
  } else if (p.x >= s) {
    return 3;
  } else if (p.y < 0) {
    return 4;
  }
  return 5;
}

function createFaces(s) {
  const vx = new Vec3(1, 0, 0);
  const vy = new Vec3(0, 1, 0);
  const vz = new Vec3(0, 0, 1);
  const vzn = vz.neg();

  return [
    new Face({ sideLength: s, normal: vz.neg(), v: vy }),
    new Face({ sideLength: s, normal: vx, v: vzn }),
    new Face({ sideLength: s, normal: vy.neg(), v: vzn }),
    new Face({ sideLength: s, normal: vx.neg(), v: vzn }),
    new Face({ sideLength: s, normal: vy, v: vzn }),
    new Face({ sideLength: s, normal: vz, v: vy.neg() }),
  ];
}

function initialState(sideLength) {
  console.log('Resetting with sideLength:', sideLength);

  const data = {
    faces: createFaces(sideLength),
    position: new Vec3(-1, 0, 0),
    velocity: new Vec3(0, 1, 0),
    turnFactor: 0,
    snakeCells: [],
    maxLength: 12,
    isMounted: false,
  };

  return data;
}

export default {
  data() {
    return initialState(this.sideLength);
  },

  props: ['sideLength'],

  components: {
    FisheyeProjection,
    CubeMap,
  },

  computed: {
    cubeCenter() {
      const d = (this.sideLength - 1) / 2;
      return new Vec3(d, d, d);
    },

    cameraDirection() {
      return this.position.sub(this.cubeCenter).normalize();
      // return new Vec3(1, 0, 0);
    },

    faceIndex() {
      return getFaceIndex(this.position, this.sideLength);
    },

    currentFace() {
      return this.faces[this.faceIndex];
    },

    cubeMapFaces() {
      return this.$refs.cubeMap.faces;
    },
  },

  methods: {
    turnLeft() {
      this.turnFactor = 1;
    },

    turnRight() {
      this.turnFactor = -1;
    },

    tick() {
      // Calculate new position and velocity
      const navigationResult = this.navigate();

      // TODO check that navigation result is okay

      // Update position and velocity
      this.position = navigationResult.position;
      this.velocity = navigationResult.velocity;
      this.turnFactor = 0;

      this.snakeCells.unshift(this.newCell(
        this.position.sub(this.velocity),
        this.position,
        this.turnFactor,
      ));

      if (this.snakeCells.length > this.maxLength) {
        this.snakeCells.pop();
      }

      this.draw();
    },

    draw() {
      this.$refs.cubeMap.draw();
    },

    navigate() {
      let vn = this.velocity;

      if (this.turnFactor) {
        vn = this.currentFace.normal.cross(vn).mult(this.turnFactor);
      }

      let pn = this.position.add(vn);

      if (this.currentFace.isOutside(pn)) {
        pn = pn.add(this.currentFace.normal);
        vn = this.currentFace.normal;
      }

      return {
        position: pn.round(),
        velocity: vn.round(),
      };
    },

    newCell(previousPosition, currentPosition, turnFactor) {
      const faceIndex = getFaceIndex(currentPosition, this.sideLength);
      const face = this.faces[faceIndex];

      const p1 = face.project(previousPosition);
      const p2 = face.project(currentPosition);

      let type = 2;
      if (turnFactor === 0 && p1.x === p2.x) {
        type = 0;
      } else if (turnFactor === 0 && p1.y === p2.y) {
        type = 1;
      }

      return {
        position: currentPosition,
        face,
        faceIndex,
        projectedPosition: face.project(currentPosition),
        type,
      };
    },

    reset() {
      forEach(initialState(this.sideLength), (value, key) => {
        this[key] = value;
      });
      this.isMounted = true;

      for (let i = 0; i < this.maxLength; i += 1) {
        this.tick();
      }
    },
  },

  mounted() {
    this.reset(this.sideLength);
  },

  watch: {
    sideLength(sideLength) {
      console.log('resetting from watcher');
      this.reset(sideLength);
    },
  },
};
</script>
