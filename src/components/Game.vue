<template>
<graphics
  :camera-direction="cameraDirection"
  :side-length="sideLength"
  :head-info="headInfo"
  :snake-cells="snakeCells"
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

export default {
  data() {
    return {
      faces: null,
      position: null,
      velocity: null,
      turnFactor: null,
      snakeCells: null,
      maxLength: null,
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

    currentFace() {
      return this.faces[this.faceIndex];
    },

    headInfo() {
      const faceNames = ['top', 'left', 'front', 'right', 'back', 'bottom'];

      return {
        face: faceNames[this.faceIndex],
        position: this.currentFace.project(this.position).asArray(),
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
      this.snakeCells.unshift(this.newCell(
        this.position.sub(this.velocity),
        this.position,
        this.turnFactor,
      ));

      if (this.snakeCells.length > this.maxLength) {
        this.snakeCells.pop();
      }

      console.log(this.snakeCells.map(v => v.position.toString()));

      // Calculate new position and velocity
      const navigationResult = this.navigate();

      // TODO check that navigation result is okay

      // Update position and velocity
      this.position = navigationResult.position;
      this.velocity = navigationResult.velocity;
      this.turnFactor = 0;
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

    reset(sideLength = this.sideLength) {
      console.log('Resetting with sideLength:', sideLength);
      this.faces = createFaces(sideLength);
      this.position = new Vec3(-1, 0, 0);
      this.velocity = new Vec3(0, 1, 0);
      this.turnFactor = 0;
      this.snakeCells = [];
      this.maxLength = 3;

      for (let i = 0; i < this.maxLength; i += 1) {
        this.tick();
      }
    },
  },

  created() {
    this.reset();
  },

  watch: {
    sideLength(sideLength) {
      console.log('resetting from watcher');
      this.reset(sideLength);
    },
  },
};
</script>