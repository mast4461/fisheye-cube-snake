import Face from './Face';
// import Vec2 from './Vec2';
import Vec3 from './Vec3';

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

function navigate({ position, velocity, faces, sideLength }) {
  const face = faces[getFaceIndex(position, sideLength)];

  let pn = position.add(velocity);
  let vn = velocity;

  if (face.isOutside(pn)) {
    pn = pn.add(face.normal);
    vn = face.normal;
  }

  return {
    position: pn.map(Math.round),
    velocity: vn.map(Math.round),
  };
}

class Game {
  constructor(sideLength) {
    this.sideLength = sideLength;

    this.faces = createFaces(sideLength);

    this.position = new Vec3(-1, 0, 0);
    this.velocity = new Vec3(0, 1, 0);

    const d = (sideLength - 1) / 2;
    this.cubeCenter = new Vec3(d, d, d);
  }

  tick() {
    // TODO Update velocity according to key input

    // Calculate new position and velocity
    const navigationResult = navigate({
      position: this.position,
      velocity: this.velocity,
      faces: this.faces,
      sideLength: this.sideLength,
    });

    // TODO check that navigation result is okay

    // Update position and velocity
    this.position = navigationResult.position;
    this.velocity = navigationResult.velocity;
  }

  getCameraDirection() {
    return this.position.sub(this.cubeCenter).normalize();
  }

  getFaceIndex() {
    return getFaceIndex(this.position, this.sideLength);
  }

  getHeadInfo() {
    const faceNames = ['top', 'left', 'front', 'right', 'back', 'bottom'];
    const faceIndex = this.getFaceIndex();

    return {
      face: faceNames[faceIndex],
      position: this.faces[faceIndex].project(this.position).asArray(),
    };
  }
}

export default Game;
