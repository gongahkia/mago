import { RNG } from '../../utils/rng';

export interface BSPConfig {
  width: number;
  height: number;
  minRoomSize: number;
  maxRoomSize: number;
  seed?: number;
  maxDepth?: number;
  roomPadding?: number;
}

interface BSPNode {
  x: number;
  y: number;
  width: number;
  height: number;
  left?: BSPNode;
  right?: BSPNode;
  room?: Room;
}

interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class BSPDungeonGenerator {
  private root: BSPNode;
  private rooms: Room[] = [];
  private corridors: { x1: number; y1: number; x2: number; y2: number }[] = [];
  private rng: RNG;

  constructor(private config: BSPConfig) {
    this.rng = new RNG(config.seed || Math.random());
    this.root = {
      x: 0,
      y: 0,
      width: config.width,
      height: config.height
    };
    this.splitNode(this.root, 0);
    this.createRooms(this.root);
    this.connectRooms(this.root);
  }

  private splitNode(node: BSPNode, depth: number): void {
    const maxDepth = this.config.maxDepth || 5;
    if (depth >= maxDepth) return;

    const splitHorizontal = this.rng.next() > 0.5;
    const max = (splitHorizontal ? node.height : node.width) - this.config.minRoomSize * 2;
    
    if (max <= this.config.minRoomSize) return;

    const splitPos = this.rng.nextInt(
      this.config.minRoomSize,
      max
    );

    if (splitHorizontal) {
      node.left = {
        x: node.x,
        y: node.y,
        width: node.width,
        height: splitPos
      };
      node.right = {
        x: node.x,
        y: node.y + splitPos,
        width: node.width,
        height: node.height - splitPos
      };
    } else {
      node.left = {
        x: node.x,
        y: node.y,
        width: splitPos,
        height: node.height
      };
      node.right = {
        x: node.x + splitPos,
        y: node.y,
        width: node.width - splitPos,
        height: node.height
      };
    }

    this.splitNode(node.left, depth + 1);
    this.splitNode(node.right, depth + 1);
  }

  private createRooms(node: BSPNode): void {
    if (node.left || node.right) {
      if (node.left) this.createRooms(node.left);
      if (node.right) this.createRooms(node.right);
      if (node.left && node.right) {
        this.createCorridor(node.left.room!, node.right.room!);
      }
    } else {
      const padding = this.config.roomPadding || 1;
      const roomWidth = this.rng.nextInt(
        this.config.minRoomSize,
        Math.min(node.width - padding * 2, this.config.maxRoomSize)
      );
      const roomHeight = this.rng.nextInt(
        this.config.minRoomSize,
        Math.min(node.height - padding * 2, this.config.maxRoomSize)
      );
      const roomX = node.x + padding + this.rng.nextInt(0, node.width - roomWidth - padding * 2);
      const roomY = node.y + padding + this.rng.nextInt(0, node.height - roomHeight - padding * 2);

      node.room = {
        x: roomX,
        y: roomY,
        width: roomWidth,
        height: roomHeight
      };
      this.rooms.push(node.room);
    }
  }

  private createCorridor(a: Room, b: Room): void {
    const pointA = {
      x: a.x + Math.floor(a.width / 2),
      y: a.y + Math.floor(a.height / 2)
    };
    const pointB = {
      x: b.x + Math.floor(b.width / 2),
      y: b.y + Math.floor(b.height / 2)
    };

    if (this.rng.next() > 0.5) {
      this.corridors.push({
        x1: pointA.x,
        y1: pointA.y,
        x2: pointB.x,
        y2: pointA.y
      });
      this.corridors.push({
        x1: pointB.x,
        y1: pointA.y,
        x2: pointB.x,
        y2: pointB.y
      });
    } else {
      this.corridors.push({
        x1: pointA.x,
        y1: pointA.y,
        x2: pointA.x,
        y2: pointB.y
      });
      this.corridors.push({
        x1: pointA.x,
        y1: pointB.y,
        x2: pointB.x,
        y2: pointB.y
      });
    }
  }

  public getDungeon(): { grid: number[][]; rooms: Room[]; corridors: typeof this.corridors } {
    const grid = Array.from({ length: this.config.height }, () =>
      Array(this.config.width).fill(0)
    );

    for (const room of this.rooms) {
      for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
          grid[y][x] = 1;
        }
      }
    }

    for (const corridor of this.corridors) {
      const dx = corridor.x2 - corridor.x1;
      const dy = corridor.y2 - corridor.y1;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      
      for (let i = 0; i <= steps; i++) {
        const x = corridor.x1 + Math.round((dx * i) / steps);
        const y = corridor.y1 + Math.round((dy * i) / steps);
        if (y >= 0 && y < grid.length && x >= 0 && x < grid[y].length) {
          grid[y][x] = 1;
        }
      }
    }

    return {
      grid,
      rooms: this.rooms,
      corridors: this.corridors
    };
  }
}