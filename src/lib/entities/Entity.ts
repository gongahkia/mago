import { Position, Direction, AIType } from '../../types/gameTypes';
import { aStarPathfind } from '../utilities/pathfinding';
import { manhattanDistance, isInBounds } from '../utilities/geometry';

export class Entity {
  public id: string;
  public char: string;
  public color: string;
  public position: Position;
  public aiType?: AIType;
  public health: number;
  public visionRange: number;

  constructor(config: {
    id: string;
    char: string;
    color: string;
    position: Position;
    aiType?: AIType;
    health?: number;
    vision?: number;
  }) {
    this.id = config.id;
    this.char = config.char;
    this.color = config.color;
    this.position = config.position;
    this.aiType = config.aiType;
    this.health = config.health ?? 10;
    this.visionRange = config.vision ?? 8;
  }

  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  public canSee(targetPos: Position, dungeonMap: boolean[][]): boolean {
    if (manhattanDistance(this.position, targetPos) > this.visionRange) {
      return false;
    }
    
    const dx = Math.abs(targetPos[0] - this.position[0]);
    const dy = -Math.abs(targetPos[1] - this.position[1]);
    const sx = this.position[0] < targetPos[0] ? 1 : -1;
    const sy = this.position[1] < targetPos[1] ? 1 : -1;
    let err = dx + dy;
    
    let currentX = this.position[0];
    let currentY = this.position[1];
    
    while (true) {
      if (currentX === targetPos[0] && currentY === targetPos[1]) break;
      if (!dungeonMap[currentY][currentX]) return false;
      
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        currentX += sx;
      }
      if (e2 <= dx) {
        err += dx;
        currentY += sy;
      }
    }
    return true;
  }

  public getSaveState() {
    return {
      id: this.id,
      char: this.char,
      color: this.color,
      position: [...this.position],
      aiType: this.aiType,
      health: this.health
    };
  }
}