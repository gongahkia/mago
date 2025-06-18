import { aStarPathfind } from '../utilities/pathfinding';
import { Position, isInBounds } from '../utilities/geometry';

const BSP_ITERATIONS = 4;
const CELLULAR_AUTOMATA_STEPS = 5;

export class DungeonGenerator {
  private width = 80;
  private height = 40;
  
  generateLevel(level: number): boolean[][] {
    let map = this.createBSPMap();
    map = this.applyCellularAutomata(map, CELLULAR_AUTOMATA_STEPS);
    return this.connectRegions(map);
  }

  private createBSPMap(): boolean[][] {
    const map = Array(this.height).fill(false)
      .map(() => Array(this.width).fill(false));
    
    const split = (x: number, y: number, w: number, h: number, iter: number) => {
      if (iter <= 0 || w < 5 || h < 5) {
        this.createRoom(map, x, y, w, h);
        return;
      }

      if (w > h) {
        const splitX = x + Math.floor(w/2) + (Math.random() * 2 - 1);
        split(x, y, splitX - x, h, iter-1);
        split(splitX+1, y, x + w - splitX - 1, h, iter-1);
      } else {
        const splitY = y + Math.floor(h/2) + (Math.random() * 2 - 1);
        split(x, y, w, splitY - y, iter-1);
        split(x, splitY+1, w, y + h - splitY - 1, iter-1);
      }
    };

    split(1, 1, this.width-2, this.height-2, BSP_ITERATIONS);
    return map;
  }

  private createRoom(map: boolean[][], x: number, y: number, w: number, h: number) {
    for (let i = Math.max(y, 0); i < Math.min(y + h, this.height); i++) {
      for (let j = Math.max(x, 0); j < Math.min(x + w, this.width); j++) {
        map[i][j] = true;
      }
    }
  }

  private applyCellularAutomata(map: boolean[][], steps: number): boolean[][] {
    for (let step = 0; step < steps; step++) {
      const newMap = map.map(row => [...row]);
      
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const neighbors = this.countNeighbors(map, x, y);
          newMap[y][x] = neighbors >= 4;
        }
      }
      map = newMap;
    }
    return map;
  }

  private countNeighbors(map: boolean[][], x: number, y: number): number {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (isInBounds([nx, ny], this.width, this.height) && map[ny][nx]) {
          count++;
        }
      }
    }
    return count;
  }

  private connectRegions(map: boolean[][]): boolean[][] {
    const regions = this.findRegions(map);
    
    for (let i = 1; i < regions.length; i++) {
      const start = regions[i-1][Math.floor(Math.random() * regions[i-1].length)];
      const end = regions[i][Math.floor(Math.random() * regions[i].length)];
      this.carvePath(map, start, end);
    }
    return map;
  }

  private findRegions(map: boolean[][]): Position[][] {
    const visited = new Set<string>();
    const regions: Position[][] = [];
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (map[y][x] && !visited.has(`${x},${y}`)) {
          const region = this.floodFill(map, x, y, visited);
          regions.push(region);
        }
      }
    }
    return regions;
  }

  private floodFill(map: boolean[][], x: number, y: number, visited: Set<string>): Position[] {
    const queue: Position[] = [[x, y]];
    const region: Position[] = [];
    
    while (queue.length > 0) {
      const [cx, cy] = queue.pop()!;
      if (!visited.has(`${cx},${cy}`) && map[cy][cx]) {
        visited.add(`${cx},${cy}`);
        region.push([cx, cy]);
        
        for (const [dx, dy] of [[0,1], [1,0], [0,-1], [-1,0]]) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (isInBounds([nx, ny], this.width, this.height)) {
            queue.push([nx, ny]);
          }
        }
      }
    }
    return region;
  }

  private carvePath(map: boolean[][], start: Position, end: Position) {
    let current = start;
    
    while (!positionsEqual(current, end)) {
      const dx = Math.sign(end[0] - current[0]);
      const dy = Math.sign(end[1] - current[1]);
      
      if (Math.random() < 0.5 && dx !== 0) {
        current = [current[0] + dx, current[1]];
      } else if (dy !== 0) {
        current = [current[0], current[1] + dy];
      }
      
      if (isInBounds(current, this.width, this.height)) {
        map[current[1]][current[0]] = true;
      }
    }
  }
}