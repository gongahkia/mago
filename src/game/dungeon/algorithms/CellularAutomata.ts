import { RNG } from '../../utils/rng';

export interface CellularAutomataConfig {
  width: number;
  height: number;
  seed?: number;
  initialWallProbability?: number;
  iterations?: number;
  survivalThreshold?: number;
  birthThreshold?: number;
}

export class CellularAutomata {
  private grid: number[][];
  private rng: RNG;

  constructor(private config: CellularAutomataConfig) {
    this.rng = new RNG(config.seed || Math.random());
    this.grid = this.initializeGrid();
  }

  private initializeGrid(): number[][] {
    return Array.from({ length: this.config.height }, () =>
      Array.from({ length: this.config.width }, () =>
        this.rng.next() < (this.config.initialWallProbability || 0.45) ? 1 : 0
      )
    );
  }

  private countNeighbors(x: number, y: number): number {
    let count = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const nx = x + dx;
        const ny = y + dy;
        if (
          nx >= 0 && nx < this.config.width &&
          ny >= 0 && ny < this.config.height
        ) {
          count += this.grid[ny][nx];
        }
      }
    }
    return count;
  }

  public generate(): number[][] {
    const iterations = this.config.iterations || 5;
    
    for (let i = 0; i < iterations; i++) {
      const newGrid = Array.from({ length: this.config.height }, (_, y) =>
        Array.from({ length: this.config.width }, (_, x) => {
          const neighbors = this.countNeighbors(x, y);
          return neighbors >= (this.config.survivalThreshold || 5) ? 1 :
                 neighbors <= (this.config.birthThreshold || 3) ? 0 :
                 this.grid[y][x];
        })
      );
      this.grid = newGrid;
    }
    
    return this.grid;
  }
}