export type Position = [number, number];

export type Direction = {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
};

export type AIType = 'passive' | 'hostile' | 'neutral';

export interface Entity {
  id: string;
  char: string;
  color: string;
  position: Position;
  aiType?: AIType;
  health?: number;
}

export interface Player extends Entity {
  inventory: string[];
  experience: number;
}

export interface GameState {
  dungeonLevel: number;
  player: Player;
  entities: Entity[];
  currentTurn: 'player' | 'ai';
  dungeonMap: boolean[][];
}

export type GameAction = 
  | { type: 'moveEntity'; entityId: string; direction: Direction }
  | { type: 'resetGame' }
  | { type: 'advanceTurn' };