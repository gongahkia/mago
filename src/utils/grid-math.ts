export function gridToPixel(x: number, y: number, tileSize: number): { px: number; py: number } {
  return { px: x * tileSize, py: y * tileSize };
}

export function pixelToGrid(px: number, py: number, tileSize: number): { x: number; y: number } {
  return { x: Math.floor(px / tileSize), y: Math.floor(py / tileSize) };
}

export function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

export function isAdjacent(x1: number, y1: number, x2: number, y2: number): boolean {
  return manhattanDistance(x1, y1, x2, y2) === 1;
}

export function getNeighbors(x: number, y: number): { x: number; y: number }[] {
  return [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 }
  ];
}

export function clampGrid(x: number, y: number, width: number, height: number): { x: number; y: number } {
  return {
    x: Math.min(Math.max(x, 0), width - 1),
    y: Math.min(Math.max(y, 0), height - 1)
  };
}