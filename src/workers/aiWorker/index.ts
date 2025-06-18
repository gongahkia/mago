import { expose } from 'comlink';
import { loadLaMiniGPT } from './modelLoader';
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
    await this.init();

    const prompt = `Given roguelike game state:
- Dungeon level: ${gameState.dungeonLevel}
- Player position: ${JSON.stringify(gameState.player.position)}
- NPC position: ${JSON.stringify(entity.position)}
- NPC type: ${entity.aiType}
- Visible enemies: ${gameState.entities.length}

Respond ONLY with a valid JSON object matching this schema:
{ "action": "move"|"attack"|"flee", "direction": {"x": -1|0|1, "y": -1|0|1}, "dialogue": "<optional flavor text>" }
Do not include any explanation or extra text.`;

    const output = await generator(prompt, { max_new_tokens: 50, temperature: 0.3 });
    const outputText = output[0]?.generated_text ?? '';
    const match = outputText.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error("No JSON found in model output");
    const action = JSON.parse(match[0]);
    return action.direction;
  }
};

export type AIWorker = typeof worker;
expose(worker);