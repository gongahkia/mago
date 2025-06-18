import { expose } from 'comlink';
import { loadLaMiniGPT } from './modelLoader';
import { processDecision } from './decisionProcessor';
import type { GameState, Entity, Position, Tile } from '../../types/gameTypes';
import { aStarPathfind } from '../../lib/utilities/pathfinding';

let generator: any = null;
let tokenizer: any = null;

const worker = {
  async init() {
    if (!generator) {
      const result = await loadLaMiniGPT();
      generator = result.generator;
      tokenizer = result.tokenizer;
    }
  },

  async decideActionForEntity(entity: Entity, gameState: GameState) {
    try {
      await this.init();
      const context = this.createContextString(entity, gameState);
      
      // Add error boundary for generation
      if (!generator?.generate) {
        throw new Error('Generator not initialized');
      }

      const response = await generator.generate(context, {
        max_length: 50,
        temperature: 0.7
      });
      
      return processDecision(response[0].generated_text, entity, gameState);
    } catch (error) {
      console.error('[AI Worker] Critical error:', error);
      return aStarPathfind(entity.position, gameState.player.position);
    }
  },

  createContextString(entity: Entity, gameState: GameState): string {
    return `Entity ${entity.id} at ${entity.position.x},${entity.position.y}. ` +
      `Player at ${gameState.player.position.x},${gameState.player.position.y}. ` +
      `Nearby tiles: ${this.getSurroundingTiles(entity.position, gameState.dungeonMap)}`;
  },

  getSurroundingTiles(pos: Position, dungeonMap: [string, Tile][]) { // Changed to array
    const tiles = [];
    const map = new Map(dungeonMap); // Reconstruct Map in worker
    
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const key = `${pos.x + dx},${pos.y + dy}`;
        tiles.push(map.get(key)?.type || 'wall');
      }
    }
    return tiles.join(',');
  }
};

export type AIWorker = typeof worker;
expose(worker);