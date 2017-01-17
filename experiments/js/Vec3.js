class Vec3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  cross(v) {
    if (!(v instanceof Vec3)) {
      throw 'Input argument must be of type Vec3';
    }
    const t = this;
    return new Vec3(
      t.y * v.z - t.z * v.y,
      t.z * v.x - t.x * v.z,
      t.x * v.y - t.y * v.x
    );
  }

  mult(a) {
    return this.map(x => x*a);
  }

  neg() {
    return this.map(x => -x);
  }

  map(f) {
    return new Vec3(f(this.x), f(this.y), f(this.z))
  }

  add(v) {
    if (v instanceof Vec3) {
      return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    } else {
      return new this.map(x => x + v);
    }
  }

  sub(v) {
    if (v instanceof Vec3) {
      return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    } else {
      return new this.map(x => x - v);
    }
  }

  dot(v) {
    return this.x*v.x + this.y*v.y + this.z*v.z;
  }
}

module.exports = Vec3;