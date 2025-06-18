import { expose } from 'comlink';
import { loadPhi3Mini } from './modelLoader';
import { processDecision } from './decisionProcessor';
import type { GameState, Entity } from '../../types/gameTypes';

let aiModel: Awaited<ReturnType<typeof loadPhi3Mini>>;

const worker = {
  async init() {
    if (!aiModel) {
      aiModel = await loadPhi3Mini();
    }
  },

  async decideActionForEntity(entity: Entity, gameState: GameState) {
    await this.init();
    return processDecision(entity, gameState, aiModel.context);
  },

  async heartbeat() {
    return { status: 'alive', timestamp: Date.now() };
  }
};

export type AIWorker = typeof worker;
expose(worker);