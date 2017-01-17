const Vec2 = require('./Vec2.js');
const Vec3 = require('./Vec3.js');
const Face = require('./Face.js');

const s = 4;


function getFaces(s) {
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



const faces = getFaces(s);

function getFaceIndex(p /*Vec3*/, s) {
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
  } else {
    return 5;
  }
}

// function testGetFaceIndex(p, s, iExpected) {
//   const iActual = getFaceIndex(p, s);
//   if (iActual !== iExpected) {
//     console.log({ p, s, iExpected, iActual });
//     throw 'Not equal';
//   }
// }

// testGetFaceIndex(new Vec3(0, 0, -1), s, 5)
// testGetFaceIndex(new Vec3(1, 1, 3), s, 0)
// testGetFaceIndex(new Vec3(-1, 2, 0), s, 1)
// testGetFaceIndex(new Vec3(3, 1, 1), s, 3)
// testGetFaceIndex(new Vec3(1, -1, 1), s, 4)
// testGetFaceIndex(new Vec3(0, 3, 1), s, 2)
// testGetFaceIndex(new Vec3(3, 1, 0), s, 3)





// function testIsOutside(face, p, expected) {
//   const actual = face.isOutside(p);
//   if (expected !== actual) {
//     console.log('expected:', expected);
//     console.log('actual:', actual);
//     console.log({p, face});
//     throw 'Not equal.'
//   }
// }

// for (let i = 0; i < s; i++) {
//   for (let j = 0; j < s; j++) {
//     // Bottom face points don't belong to top face
//     testIsOutside(faces[0], new Vec3(i, j, -1), true);

//     testIsOutside(faces[0], new Vec3(-1, i, j), true); // left face
//     testIsOutside(faces[0], new Vec3(s, i, j), true); // right face

//     testIsOutside(faces[0], new Vec3(i, s, j), true); // front face
//     testIsOutside(faces[0], new Vec3(i, -1, j), true); // back face

//     testIsOutside(faces[2], new Vec3(i, s, j), false); // back face
//   }
// }

// // Top face points are outside and inside
// for (let x = -1; x <= s; x++) {
//   for (let y = -1; y <= s; y++) {
//     testIsOutside(faces[0], new Vec3(x, y, s), x < 0 || x >= s || y < 0 || y >= s);
//   }
// }

// testIsOutside(faces[2], new Vec3(2, 4, 1), false);




function navigate({position, velocity, iFace}) {
  let pn = position.add(velocity);
  const face = faces[iFace];
  if (face.isOutside(pn)) {
    pn = pn.add(face.normal);
    velocity = face.normal;
    iFace = getFaceIndex(pn, s);
  }
  return {
    position: pn.map(Math.round),
    velocity: velocity.map(Math.round),
    iFace: iFace,
  }
}

// Bottom face
// let iFace = 5;
// let position = new Vec3(1, 1, -1);
// let velocity = new Vec3(-1, 0, 0);

// Front face
let position = new Vec3(1, 1, -1);
let iFace = getFaceIndex(position);
let velocity = new Vec3(0, -1, 0);

let o = {position, velocity, iFace};
for (let i = 0; i < 30; i++) {
  const face = faces[o.iFace];
  const pp = face.project(o.position)
  // console.log(o);
  console.log(o.iFace, pp);
  o = navigate(o);
}


