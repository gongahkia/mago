export const spriteFragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
in vec2 v_texCoord;
in vec4 v_tint;
out vec4 fragColor;

void main() {
  vec4 texColor = texture(u_texture, v_texCoord);
  fragColor = texColor * v_tint;
  
  // Alpha discard for sprite sheets
  if(fragColor.a < 0.01) discard;
}
`;