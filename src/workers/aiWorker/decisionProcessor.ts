import { GameState, Entity } from '../../types/gameTypes';
import { aStarPathfind } from '../../lib/utilities/pathfinding';

const BEHAVIOR_PROMPT = `
Below is an instruction that describes a task. Write a response that appropriately completes the request.

### Instruction:
Given this roguelike game state:
- Dungeon level: {dungeonLevel}
- Player position: {playerPos}
- NPC position: {npcPos}
- NPC type: {npcType}
- Visible enemies: {visibleEnemies}

Respond ONLY with a valid JSON object matching this schema:
{ "action": "move"|"attack"|"flee", "direction": {"x": -1|0|1, "y": -1|0|1}, "dialogue": "<optional flavor text>" }
Do not include any explanation or extra text.

### Response:
`;

function extractFirstJSON(text: string): any {
  const match = text.match(/\{[\s\S]*?\}/);
  if (!match) throw new Error('No JSON object found in model output');
  return JSON.parse(match[0]);
}

function isValidAction(action: any): boolean {
  return (
    action &&
    typeof action === 'object' &&
    action.direction &&
    typeof action.direction.x === 'number' &&
    typeof action.direction.y === 'number' &&
    Math.abs(action.direction.x) <= 1 &&
    Math.abs(action.direction.y) <= 1
  );
}

export async function processDecision(
  entity: Entity,
  gameState: GameState,
  generator: any
) {
  try {
    const prompt = BEHAVIOR_PROMPT
      .replace('{dungeonLevel}', String(gameState.dungeonLevel))
      .replace('{playerPos}', JSON.stringify(gameState.player.position))
      .replace('{npcPos}', JSON.stringify(entity.position))
      .replace('{npcType}', entity.aiType || 'unknown')
      .replace('{visibleEnemies}', String(gameState.entities.length));

    const output = await generator(prompt, {
      max_new_tokens: 50,
      temperature: 0.3,
    });

    const outputText = output[0]?.generated_text || '';
    const action = extractFirstJSON(outputText);

    if (isValidAction(action)) {
      return action.direction;
    }
    throw new Error('Invalid action object');
  } catch (error) {
    console.warn('[AI] Model failed or invalid output, using pathfinding');
    return aStarPathfind(entity.position, gameState.player.position);
  }
}