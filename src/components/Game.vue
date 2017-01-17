<template>
<graphics
  :camera-direction="cameraDirection"
  :side-length="sideLength"
  :head-info="headInfo"
></graphics>
</template>

<style>

</style>

<script>
import Face from '../scripts/Face';
import Vec3 from '../scripts/Vec3';
import Graphics from './Graphics';

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
  const vzn = new Vec3(0, 0, -1);

  return [
    new Face({ sideLength: s, normal: vz.neg(), v: vy }),
    new Face({ sideLength: s, normal: vx, v: vzn }),
    new Face({ sideLength: s, normal: vy.neg(), v: vzn }),
    new Face({ sideLength: s, normal: vx.neg(), v: vzn }),
    new Face({ sideLength: s, normal: vy, v: vzn }),
    new Face({ sideLength: s, normal: vz, v: vy.neg() }),
  ];
}

function navigate({ position, velocity, faces, sideLength, turnFactor }) {
  const face = faces[getFaceIndex(position, sideLength)];
  let vn = velocity;

  if (turnFactor) {
    vn = face.normal.cross(vn).mult(turnFactor);
  }

  let pn = position.add(vn);

  if (face.isOutside(pn)) {
    pn = pn.add(face.normal);
    vn = face.normal;
  }

  return {
    position: pn.map(Math.round),
    velocity: vn.map(Math.round),
  };
}

export default {
  data() {
    return {
      faces: createFaces(this.sideLength),
      position: new Vec3(-1, 0, 0),
      velocity: new Vec3(0, 1, 0),
      turnFactor: 0,
    };
  },

  props: ['sideLength'],

  components: {
    Graphics,
  },

  computed: {
    cubeCenter() {
      const d = (this.sideLength - 1) / 2;
      return new Vec3(d, d, d);
    },

    cameraDirection() {
      return this.position.sub(this.cubeCenter).normalize();
    },

    faceIndex() {
      return getFaceIndex(this.position, this.sideLength);
    },

    headInfo() {
      const faceNames = ['top', 'left', 'front', 'right', 'back', 'bottom'];

      return {
        face: faceNames[this.faceIndex],
        position: this.faces[this.faceIndex].project(this.position).asArray(),
      };
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
      const navigationResult = navigate({
        position: this.position,
        velocity: this.velocity,
        faces: this.faces,
        sideLength: this.sideLength,
        turnFactor: this.turnFactor,
      });

      // TODO check that navigation result is okay

      // Update position and velocity
      this.position = navigationResult.position;
      this.velocity = navigationResult.velocity;
      this.turnFactor = 0;
    },
  },
};
</script>