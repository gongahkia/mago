import { expose } from 'comlink';
import { loadLaMiniGPT } from './modelLoader';
import { processDecision } from './decisionProcessor';
import type { GameState, Entity } from '../../types/gameTypes';

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
      return await processDecision(entity, gameState, generator);
    } catch (error) {
      console.error('[AI Worker] Critical error:', error);
      return aStarPathfind(entity.position, gameState.player.position);
    }
  }
};

export type AIWorker = typeof worker;
expose(worker);