const Vec2 = require('./Vec2.js');
const Vec3 = require('./Vec3.js');
const Face = require('./Face.js');

// xLow, xHigh, yLox, yHigh
const sideSwitchMatrix = [
  [1, 3, 4, 2],
  [4, 2, 0, 5],
  [1, 3, 0, 5],
  [2, 4, 0, 5],
  [3, 1, 0, 5],
  [1, 3, 2, 4],
];


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

const s = 3;
const faces = getFaces(s);

console.log(faces);


function test(input, expectedOutput) {
  const actualOutput = navigate(input);

  if (expectedOutput.iSide !== actualOutput.iSide
    || !expectedOutput.position.eq(actualOutput.position)
    || !expectedOutput.heading.eq(actualOutput.heading)) {

    console.log('expectedOutput', expectedOutput);
    console.log('actualOutput', actualOutput);
    throw 'Expected output not equal to actual';
  }
}

const oIn = {
  iSide: 0,
  position: new Vec2(0,0),
  heading: new Vec2(-1,0),
};

const oOut = {
  iSide: 1,
  position: new Vec2(0,0),
  heading: new Vec2(0,1),
};

test(oIn, oOut);

function navigate({ iSide, position, heading }) {
  const pNew = position.add(heading);


  let iSideNew = iSide;
  if (pNew.x < 0) {
    iSideNew = sideSwitchMatrix[iSide][0];
  } else if (pNew.x >= s) {
    iSideNew = sideSwitchMatrix[iSide][1];
  } else if (pNew.y < 0) {
    iSideNew = sideSwitchMatrix[iSide][2];
  } else if (pNew.y >= s) {
    iSideNew = sideSwitchMatrix[iSide][3];
  }


  return {
    iSide: iSideNew,
    position,
    heading
  };
}






