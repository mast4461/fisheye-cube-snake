import Vec3 from './Vec3';
import Vec2 from './Vec2';

class Face {
  constructor({
    sideLength, // sidelength
    normal, // Vec3
    v, // Vec3 in face's downwards direction
  }) {
    const s = sideLength;
    this.sideLength = sideLength;
    this.v = v;
    this.u = normal.cross(v).map(Math.round);
    this.normal = normal;

    const d = (s - 1) / 2;
    const logicCubeOrigin = new Vec3(d, d, d);

    // center of face in cubecentered coordinate system
    this.oLogic = logicCubeOrigin.add(normal.mult(-(s + 1) / 2));
    this.oCam = normal.mult(-s / 2).sub(this.u.mult(d)).sub(this.v.mult(d));
    this.tlLogic = logicCubeOrigin.add(this.oCam);
  }

  // Accepts Vec3
  isOutside(v) {
    const p = v.sub(this.oLogic);
    const m = ((this.sideLength - 1) / 2) + 0.5;

    return Math.abs(p.dot(this.u)) > m
      || Math.abs(p.dot(this.v)) > m
      || this.normal.dot(p) > 0;
  }

  // Accepts Vec3
  project(v) {
    const p = v.sub(this.tlLogic);
    return new Vec2(p.dot(this.u), p.dot(this.v));
  }
}

export default Face;
