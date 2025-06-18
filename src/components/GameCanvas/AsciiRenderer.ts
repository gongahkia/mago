import { GameState } from '../../types/gameTypes';

const ASCII_CHARSET = ['#', '.', ' ', '%', '=', '?', '!', '^', '<', '>', '(', ')', '[', ']', '{', '}'];
const RENDER_INTERVAL = 100; 

export class AsciiRenderer {
  private ctx: CanvasRenderingContext2D;
  private lastRenderTime = 0;
  
  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
  }

  draw(state: GameState) {
    const now = performance.now();
    if (now - this.lastRenderTime < RENDER_INTERVAL) return;
    this.lastRenderTime = now;

    const { dungeonMap, player, entities } = state;
    const viewport = this.calculateViewport(player.position);
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const startX = Math.max(viewport.x, 0);
    const startY = Math.max(viewport.y, 0);
    const endX = Math.min(viewport.x + viewport.width, dungeonMap[0].length);
    const endY = Math.min(viewport.y + viewport.height, dungeonMap.length);

    for (let y = startY; y < endY; y++) {
      const row = dungeonMap[y] || [];
      for (let x = startX; x < endX; x++) {
        this.drawTile([x, y], row[x], viewport);
      }
    }

    this.drawEntity(player, viewport);
    entities.forEach(e => this.drawEntity(e, viewport));
  }

  private drawTile(pos: [number, number], isWalkable: boolean, viewport: any) {
    const char = isWalkable ? ASCII_CHARSET[1] : ASCII_CHARSET[0];
    const [screenX, screenY] = this.worldToScreen(pos, viewport);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(char, screenX, screenY);
  }

  private drawEntity(entity: any, viewport: any) {
    const [screenX, screenY] = this.worldToScreen(entity.position, viewport);
    this.ctx.fillStyle = entity.color;
    this.ctx.fillText(entity.char, screenX, screenY);
  }

  private calculateViewport(playerPos: [number, number]) {
    const cols = Math.floor(this.canvas.width / 16);
    const rows = Math.floor(this.canvas.height / 16);
    return {
      x: playerPos[0] - Math.floor(cols/2),
      y: playerPos[1] - Math.floor(rows/2),
      width: cols,
      height: rows
    };
  }

  private worldToScreen([x, y]: [number, number], viewport: any): [number, number] {
    return [
      (x - viewport.x) * 16 + 8,
      (y - viewport.y) * 16 + 8
    ];
  }

  private isVisibleInViewport([x, y]: [number, number], viewport: any) {
    return x >= viewport.x && 
           x < viewport.x + viewport.width &&
           y >= viewport.y &&
           y < viewport.y + viewport.height;
  }
}