export const crtFragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_scene;
uniform vec2 u_resolution;
uniform float u_time;
in vec2 v_texCoord;
out vec4 fragColor;

#define SCANLINE_PERIOD 800.0
#define CHROMATIC_OFFSET 0.002
#define VIGNETTE_POWER 1.2

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  // Screen distortion
  vec2 uv = v_texCoord;
  uv.x += sin(uv.y * 50.0 + u_time * 5.0) * 0.002;
  
  // Chromatic aberration
  float r = texture(u_scene, uv + vec2(CHROMATIC_OFFSET, 0.0)).r;
  float g = texture(u_scene, uv).g;
  float b = texture(u_scene, uv - vec2(CHROMATIC_OFFSET, 0.0)).b;
  
  // Scanlines
  float scanline = sin(uv.y * SCANLINE_PERIOD + u_time * 1000.0) * 0.1 + 0.9;
  
  // Vignette
  vec2 center = uv - 0.5;
  float vignette = 1.0 - dot(center, center) * VIGNETTE_POWER;
  
  // CRT curvature
  vec2 crtUV = uv * 2.0 - 1.0;
  crtUV *= 1.0 + 0.1 * dot(crtUV, crtUV);
  crtUV = crtUV * 0.5 + 0.5;
  
  // Final color
  fragColor = vec4(r, g, b, 1.0) * scanline * vignette;
  
  // Add noise
  fragColor.rgb += random(uv + u_time) * 0.05;
}
`;