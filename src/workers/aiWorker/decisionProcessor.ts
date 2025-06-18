import { GameState, Entity } from '../../types/gameTypes';
import { Direction } from '../../lib/utilities/geometry';
import { aStarPathfind } from '../../lib/utilities/pathfinding';

const BEHAVIOR_PROMPT = `<|user|>
Given this roguelike game state:
- Dungeon level: {dungeonLevel}
- Player position: {playerPos}
- NPC position: {npcPos}
- NPC type: {npcType}
- Visible enemies: {visibleEnemies}

Respond ONLY with a valid JSON object matching this schema:
{ 
  "action": "move"|"attack"|"flee",
  "direction": {"x": -1|0|1, "y": -1|0|1},
  "dialogue": "<optional flavor text>"
}
Do not include any explanation or extra text.
<|assistant|>`;

// const BEHAVIOR_PROMPT = `<|user|>
// Given roguelike game state:
// - Dungeon level: {dungeonLevel}
// - Player position: {playerPos}
// - NPC position: {npcPos}
// - NPC type: {npcType}
// - Visible enemies: {visibleEnemies}

// Generate JSON action:
// { 
//   "action": "move"|"attack"|"flee",
//   "direction": {"x": -1|0|1, "y": -1|0|1},
//   "dialogue": "<optional flavor text>"
// }
// <|assistant|>`;

export const processDecision = async (
  entity: Entity,
  gameState: GameState,
  model: any
) => {
  try {
    const prompt = BEHAVIOR_PROMPT
      .replace('{dungeonLevel}', gameState.dungeonLevel.toString())
      .replace('{playerPos}', JSON.stringify(gameState.player.position))
      .replace('{npcPos}', JSON.stringify(entity.position))
      .replace('{npcType}', entity.aiType)
      .replace('{visibleEnemies}', gameState.entities.length.toString());

    const output = await model.generate(prompt, {
      max_new_tokens: 50,
      temperature: 0.3,
    });

    const outputText = output[0].generated_text;
    const match = outputText.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error("No JSON found in model output");
    const action = JSON.parse(match[0]);
    return isValidAction(action) ? action.direction : aStarPathfind(entity.position, gameState.player.position);
  } catch (error) {
    console.warn('AI failed, using pathfinding');
    return aStarPathfind(entity.position, gameState.player.position);
  }
};

const isValidAction = (action: any): boolean => {
  return action?.direction?.x !== undefined && 
         action?.direction?.y !== undefined &&
         Math.abs(action.direction.x) <= 1 &&
         Math.abs(action.direction.y) <= 1;
};