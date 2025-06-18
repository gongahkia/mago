import { expose } from 'comlink';
import { loadPhi3Mini } from './modelLoader';
import type { GameState, Entity } from '../../types/gameTypes';

let generator: any = null;

const worker = {
  async init(updateProgress?: (progress: number) => void) {
    if (!generator) {
      const result = await loadPhi3Mini(updateProgress);
      generator = result.generator;
    }
  },

  async decideActionForEntity(entity: Entity, gameState: GameState, updateProgress?: (progress: number) => void) {
    await this.init(updateProgress);

    const messages = [
      {
        role: 'user',
        content:
          `Given roguelike game state:\n` +
          `- Dungeon level: ${gameState.dungeonLevel}\n` +
          `- Player position: ${JSON.stringify(gameState.player.position)}\n` +
          `- NPC position: ${JSON.stringify(entity.position)}\n` +
          `- NPC type: ${entity.aiType}\n` +
          `- Visible enemies: ${gameState.entities.length}\n\n` +
          `Respond ONLY with a valid JSON object matching this schema:\n` +
          `{ "action": "move"|"attack"|"flee", "direction": {"x": -1|0|1, "y": -1|0|1}, "dialogue": "<optional flavor text>" }\n` +
          `Do not include any explanation or extra text.`
      }
    ];

    const output = await generator(messages, {
      max_new_tokens: 50,
      temperature: 0.3
    });

    const outputText = output[0]?.generated_text ?? '';
    console.log(`AI output: ${outputText}`);
    const match = outputText.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error("No JSON found in model output");
    const action = JSON.parse(match[0]);
    return action.direction;
  }
};

export type AIWorker = typeof worker;
expose(worker);