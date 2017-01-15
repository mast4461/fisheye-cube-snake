#define M_PI 3.1415926535897932384626433832795

precision mediump float;

// our textures
uniform sampler2D u_image0;
uniform sampler2D u_image1;
uniform sampler2D u_image2;
uniform sampler2D u_image3;
uniform sampler2D u_image4;
uniform sampler2D u_image5;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

struct SamplingTarget {
  int i_s;
  vec2 uv;
};

SamplingTarget xyz_to_uv(vec3 v) {
  vec3 av = abs(v);
  vec2 uv;
  int i_s;

  if (av.x >= av.y && av.x >= av.z) {
    if (av.x == v.x) {
      i_s = 0;
    } else {
      i_s = 3;
    }
    uv = vec2(v.y / v.x, v.z / v.x);
  } else if (av.y >= av.x && av.y >= av.z) {
    if (av.y == v.y) {
      i_s = 1;
    } else {
      i_s = 4;
    }
    uv = vec2(v.x / v.y, v.z / v.y);
  } else {
    if (av.z == v.z) {
      i_s = 2;
    } else {
      i_s = 5;
    }
    uv = vec2(v.x / v.z, v.y / v.z);
  }

  return SamplingTarget(i_s, uv);
}

void main() {
  // Extract relative screen coordinates from texCoord vector
  float u = v_texCoord.x;
  float v = v_texCoord.y;

  // Calculate spherical coordinates
  float phi = atan(v, u);
  float theta = u*u + v*v;
  theta = M_PI * (sqrt(theta) + theta);

  // Convert spherical coordinates to cartesian coordinates
  float sintheta = sin(theta);
  float x = sintheta*cos(phi);
  float y = sintheta*sin(phi);
  float z = cos(theta);

  // TODO transform to camera oriented coordinate system here


  // Convert camera oriented cartesian coordinates to sampling target information
  SamplingTarget st = xyz_to_uv(vec3(x, y, z));


  vec2 centeringOffset = vec2(0.5, 0.5);

  vec2 uv = st.uv;
  float m = 0.0;
  if (st.i_s == 0) {
    gl_FragColor = texture2D(u_image0, uv / vec2(2.0, 2.0) + centeringOffset, 1.0);
  } else if (st.i_s == 1) {
    uv = vec2(m - uv.x, uv.y);
    gl_FragColor = texture2D(u_image1, uv / vec2(2.0, 2.0) + centeringOffset, 1.0);
  } else if (st.i_s == 2) {
    uv = vec2(uv.y, m - uv.x);
    gl_FragColor = texture2D(u_image2, uv / vec2(2.0, 2.0) + centeringOffset, 1.0);
  } else if (st.i_s == 3) {
    uv = vec2(uv.x, m - uv.y);
    gl_FragColor = texture2D(u_image3, uv / vec2(2.0, 2.0) + centeringOffset, 1.0);
  } else if (st.i_s == 4) {
    uv = vec2(m - uv.x, m - uv.y);
    gl_FragColor = texture2D(u_image4, uv / vec2(2.0, 2.0) + centeringOffset, 1.0);
  } else {
    uv = vec2(m - uv.y, m - uv.x);
    gl_FragColor = texture2D(u_image5, uv / vec2(2.0, 2.0) + centeringOffset, 1.0);
  }
}
