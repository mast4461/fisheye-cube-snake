#define PI 3.141592653589793 // Two pi

precision mediump float;

// our textures
uniform samplerCube u_cubeMap;
uniform float u_zoom; // range 0 to 1

uniform vec3 u_v1;
uniform vec3 u_v2;
uniform vec3 u_v3;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
  // Extract relative screen coordinates from texCoord vector
  float uo = v_texCoord.x;
  float vo = v_texCoord.y;

  // "Squaring the circle" or "defishing"
  // https://arxiv.org/pdf/1509.06344.pdf
  // Analytical Methods for Squaring the Disc, Chamberlain Fong
  // float u = uo * sqrt(1.0 - vo*vo*2.0); // Factor 2.0 (0.5 * 2.0^2) because uo and vo are in range [-0.5, 0.5]
  // float v = vo * sqrt(1.0 - uo*uo*2.0);
  float u = uo;
  float v = vo;

  // Calculate spherical coordinates
  float phi = atan(v, u);
  float theta = PI * sqrt(u*u + v*v);

  // Convert spherical coordinates to cartesian coordinates
  float minusSinTheta = -sin(theta);
  float xt = minusSinTheta*cos(phi);
  float yt = minusSinTheta*sin(phi);
  float zt = cos(theta);

  // Transform to camera oriented coordinate system
  // Add positive value to the term multiplied with u_v1 to zoom
  vec3 s = vec3(zt) * u_v1 + vec3(xt) * u_v2 + vec3(yt) * u_v3;

  // Sample cubemap
  gl_FragColor = textureCube(u_cubeMap, s.xzy);
  // if (theta < PI) {
  //   gl_FragColor = textureCube(u_cubeMap, s.xzy);
  // }
}
