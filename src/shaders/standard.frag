#define M_PI 3.1415926535897932384626433832795

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
  float theta = u*u + v*v;
  theta = sqrt(theta) + theta * theta;
  theta = 1.7 * M_PI * theta;

  // Convert spherical coordinates to cartesian coordinates
  float sintheta = sin(theta);
  float xt = sintheta*cos(phi);
  float yt = sintheta*sin(phi);
  float zt = cos(theta);

  // Transform to camera oriented coordinate system
  vec3 vt = vec3(xt, yt, zt);
  float x = dot(vt, u_v1);
  float y = dot(vt, u_v2);
  float z = dot(vt, u_v3);


  // Sample cubemap
  gl_FragColor = textureCube(u_cubeMap, vec3(x, y, -z));
}
