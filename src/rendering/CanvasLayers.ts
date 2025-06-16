export class CanvasLayers {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private layers: Map<string, WebGL2RenderingContext> = new Map();
  private projectionMatrix = new Float32Array(16);

  constructor(canvasId: string = 'gameCanvas') {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.gl = this.initializeWebGL2();
    this.createOrthoMatrix();
    this.handleResize();
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private initializeWebGL2(): WebGL2RenderingContext {
    const gl = this.canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false
    });

    if (!gl) throw new Error('WebGL2 not supported');
    
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    return gl;
  }

  private createOrthoMatrix(): void {
    const near = -1000;
    const far = 1000;
    mat4.ortho(
      this.projectionMatrix,
      0,
      this.canvas.width,
      this.canvas.height,
      0,
      near,
      far
    );
  }

  private handleResize(): void {
    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.clientWidth * dpr;
    const height = this.canvas.clientHeight * dpr;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.createOrthoMatrix();
    }
  }

  beginFrame(): void {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clearColor(0.1, 0.1, 0.1, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  get context(): WebGL2RenderingContext {
    return this.gl;
  }

  get projection(): Float32Array {
    return this.projectionMatrix;
  }

  get aspectRatio(): number {
    return this.canvas.width / this.canvas.height;
  }
}