const ANSI_16_COLORS = [
  '#000000', '#800000', '#008000', '#808000',
  '#000080', '#800080', '#008080', '#c0c0c0',
  '#808080', '#ff0000', '#00ff00', '#ffff00',
  '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
];

export class ColorSystem {
  private colorPairs = new Map<string, string>();

  constructor(private ctx: CanvasRenderingContext2D) {}

  setColorPair(fg: string, bg: string) {
    const key = `${this.nearestAnsi(fg)}|${this.nearestAnsi(bg)}`;
    
    if (!this.colorPairs.has(key)) {
      const gradient = this.ctx.createLinearGradient(0, 0, 16, 16);
      gradient.addColorStop(0, this.nearestAnsi(fg));
      gradient.addColorStop(1, this.nearestAnsi(bg));
      this.colorPairs.set(key, gradient.toString());
    }
    
    this.ctx.fillStyle = this.colorPairs.get(key)!;
  }

  private nearestAnsi(hex: string): string {
    const rgb = hexToRgb(hex);
    let minDist = Infinity;
    let closest = ANSI_16_COLORS[0];
    
    for (const ansiColor of ANSI_16_COLORS) {
      const dist = colorDistance(rgb, hexToRgb(ansiColor));
      if (dist < minDist) {
        minDist = dist;
        closest = ansiColor;
      }
    }
    return closest;
  }
}

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.slice(1), 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255
  ];
}

function colorDistance(rgb1: number[], rgb2: number[]) {
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
    Math.pow(rgb1[1] - rgb2[1], 2) +
    Math.pow(rgb1[2] - rgb2[2], 2)
  );
}