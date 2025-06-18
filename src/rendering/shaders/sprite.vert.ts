export const spriteVertexShader = `#version 300 es
precision highp float;

uniform mat4 u_projection;
layout(location=0) in vec2 a_position;
layout(location=1) in vec2 a_texCoord;
layout(location=2) in vec4 a_tint;

out vec2 v_texCoord;
out vec4 v_tint;

void main() {
  gl_Position = u_projection * vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
  v_tint = a_tint;
}
`;