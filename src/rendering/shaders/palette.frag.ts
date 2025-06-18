export const paletteFragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform sampler2D u_palette;
in vec2 v_texCoord;
out vec4 fragColor;

void main() {
  vec4 texColor = texture(u_texture, v_texCoord);
  if(texColor.a < 0.01) discard;
  
  // Convert to grayscale
  float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
  
  // Sample from palette texture
  fragColor = texture(u_palette, vec2(gray, 0.0));
}
`;