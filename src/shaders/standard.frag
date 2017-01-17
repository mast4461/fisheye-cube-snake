#define TAU 6.283185307179586 // Two pi

precision mediump float;

// our textures
uniform samplerCube u_cubeMap;

uniform vec3 u_v1;
uniform vec3 u_v2;
uniform vec3 u_v3;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

struct SamplingTarget {
  int i_s;
  vec2 uv;
};
void main() {
  // Extract relative screen coordinates from texCoord vector
  float u = v_texCoord.x;
  float v = v_texCoord.y;

  // Calculate spherical coordinates
  float phi = atan(v, u);
  float theta = TAU * sqrt(u*u + v*v);

  // Convert spherical coordinates to cartesian coordinates
  float sintheta = sin(theta);
  float xt = sintheta*cos(phi);
  float yt = sintheta*sin(phi);
  float zt = cos(theta);

  // Transform to camera oriented coordinate system

  vec3 s = vec3(zt) * u_v1 + vec3(-xt) * u_v2 + vec3(-yt) * u_v3;

  // Sample cubemap
  gl_FragColor = textureCube(u_cubeMap, s.xzy);
}
