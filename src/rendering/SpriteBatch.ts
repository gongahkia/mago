import { mat4 } from 'gl-matrix';

export class SpriteBatch {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private vbo: WebGLBuffer;
  private ibo: WebGLBuffer;
  private texture: WebGLTexture | null = null;
  private projectionMatrix: Float32Array;
  private MAX_SPRITES = 2048;
  private VERTICES_PER_SPRITE = 4;
  private INDICES_PER_SPRITE = 6;
  private vertexData: Float32Array;
  private indexData: Uint16Array;
  private currentSpriteCount = 0;

  constructor(gl: WebGL2RenderingContext, projectionMatrix: Float32Array) {
    this.gl = gl;
    this.projectionMatrix = projectionMatrix;
    this.vertexData = new Float32Array(this.MAX_SPRITES * this.VERTICES_PER_SPRITE * 8); 
    this.indexData = new Uint16Array(this.MAX_SPRITES * this.INDICES_PER_SPRITE);
    this.program = this.createShaderProgram();
    this.vao = this.createVertexArray();
    this.vbo = this.createVertexBuffer();
    this.ibo = this.createIndexBuffer();
    this.generateIndices();
  }

  private createShaderProgram(): WebGLProgram {
    const vs = `#version 300 es
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
    }`;

    const fs = `#version 300 es
    precision mediump float;
    uniform sampler2D u_texture;
    
    in vec2 v_texCoord;
    in vec4 v_tint;
    out vec4 fragColor;
    
    void main() {
      vec4 texColor = texture(u_texture, v_texCoord);
      fragColor = texColor * v_tint;
    }`;

    const program = this.gl.createProgram()!;
    const compileShader = (type: number, source: string) => {
      const shader = this.gl.createShader(type)!;
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.error(this.gl.getShaderInfoLog(shader));
      }
      return shader;
    };

    this.gl.attachShader(program, compileShader(this.gl.VERTEX_SHADER, vs));
    this.gl.attachShader(program, compileShader(this.gl.FRAGMENT_SHADER, fs));
    this.gl.linkProgram(program);
    
    return program;
  }

  private createVertexArray(): WebGLVertexArrayObject {
    const vao = this.gl.createVertexArray()!;
    this.gl.bindVertexArray(vao);
    return vao;
  }

  private createVertexBuffer(): WebGLBuffer {
    const vbo = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
    
    const stride = 8 * Float32Array.BYTES_PER_ELEMENT;
    
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, stride, 0);
    this.gl.enableVertexAttribArray(0);
    
    this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
    this.gl.enableVertexAttribArray(1);
    
    this.gl.vertexAttribPointer(2, 4, this.gl.FLOAT, false, stride, 4 * Float32Array.BYTES_PER_ELEMENT);
    this.gl.enableVertexAttribArray(2);

    return vbo;
  }

  private createIndexBuffer(): WebGLBuffer {
    const ibo = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
    return ibo;
  }

  private generateIndices(): void {
    let offset = 0;
    for (let i = 0; i < this.MAX_SPRITES; i++) {
      const base = i * 4;
      this.indexData[offset++] = base;
      this.indexData[offset++] = base + 1;
      this.indexData[offset++] = base + 2;
      this.indexData[offset++] = base + 2;
      this.indexData[offset++] = base + 3;
      this.indexData[offset++] = base;
    }
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      this.indexData,
      this.gl.STATIC_DRAW
    );
  }

  begin(texture: WebGLTexture): void {
    if (this.texture !== texture) {
      this.flush();
      this.texture = texture;
    }
  }

  drawSprite(
    x: number, y: number,
    width: number, height: number,
    u: number, v: number,
    u2: number, v2: number,
    tint: [number, number, number, number] = [1,1,1,1]
  ): void {
    if (this.currentSpriteCount >= this.MAX_SPRITES) {
      this.flush();
    }

    const offset = this.currentSpriteCount * 8 * 4;
    
    // top-left
    this.vertexData[offset]     = x;
    this.vertexData[offset + 1] = y;
    this.vertexData[offset + 2] = u;
    this.vertexData[offset + 3] = v;
    this.vertexData.set(tint, offset + 4);

    // top-right
    this.vertexData[offset + 8] = x + width;
    this.vertexData[offset + 9] = y;
    this.vertexData[offset + 10] = u2;
    this.vertexData[offset + 11] = v;
    this.vertexData.set(tint, offset + 12);

    // bottom-right
    this.vertexData[offset + 16] = x + width;
    this.vertexData[offset + 17] = y + height;
    this.vertexData[offset + 18] = u2;
    this.vertexData[offset + 19] = v2;
    this.vertexData.set(tint, offset + 20);

    // bottom-left
    this.vertexData[offset + 24] = x;
    this.vertexData[offset + 25] = y + height;
    this.vertexData[offset + 26] = u;
    this.vertexData[offset + 27] = v2;
    this.vertexData.set(tint, offset + 28);

    this.currentSpriteCount++;
  }

  flush(): void {
    if (this.currentSpriteCount === 0) return;

    this.gl.useProgram(this.program);
    this.gl.bindVertexArray(this.vao);
    
    if (this.texture) {
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'u_texture'), 0);
    }

    this.gl.uniformMatrix4fv(
      this.gl.getUniformLocation(this.program, 'u_projection'),
      false,
      this.projectionMatrix
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
    this.gl.bufferSubData(
      this.gl.ARRAY_BUFFER,
      0,
      this.vertexData.slice(0, this.currentSpriteCount * 8 * 4)
    );

    this.gl.drawElements(
      this.gl.TRIANGLES,
      this.currentSpriteCount * 6,
      this.gl.UNSIGNED_SHORT,
      0
    );

    this.currentSpriteCount = 0;
  }
}