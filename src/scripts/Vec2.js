class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    if (v instanceof Vec2) {
      return new Vec2(this.x + v.x, this.y + v.y);
    }
    return new Vec2(this.x + v, this.y + v);
  }

  sub(v) {
    if (v instanceof Vec2) {
      return new Vec2(this.x - v.x, this.y - v.y);
    }
    return new Vec2(this.x - v, this.y - v);
  }

  eq(v) {
    if (v instanceof Vec2) {
      return this.x === v.x && this.y === v.y;
    }
    return false;
  }

  asArray() {
    return [this.x, this.y];
  }
}

export default Vec2;
