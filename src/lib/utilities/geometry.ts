export type Position = [number, number];
export type Direction = { x: -1 | 0 | 1; y: -1 | 0 | 1 };

export const addPositions = (a: Position, b: Position): Position => [
  a[0] + b[0],
  a[1] + b[1]
];

export const positionsEqual = (a: Position, b: Position): boolean => 
  a[0] === b[0] && a[1] === b[1];

export const allDirections: Direction[] = [
  { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
  { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 }
];

export const isInBounds = (pos: Position, width: number, height: number): boolean => 
  pos[0] >= 0 && pos[0] < width && pos[1] >= 0 && pos[1] < height;

export const manhattanDistance = (a: Position, b: Position): number => 
  Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);