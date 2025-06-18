import { GameState, Entity } from '../../types/gameTypes';
import { Direction } from '../../lib/utilities/geometry';
import { aStarPathfind } from '../../lib/utilities/pathfinding';

const BEHAVIOR_PROMPT = `Given roguelike game state:
- Dungeon level: {dungeonLevel}
- Player position: {playerPos}
- NPC position: {npcPos}
- NPC type: {npcType}
- Visible enemies: {visibleEnemies}

Generate JSON action following this schema:
{ 
  "action": "move"|"attack"|"flee",
  "direction": {"x": -1|0|1, "y": -1|0|1},
  "dialogue": "<optional flavor text>"
}`;

export const processDecision = async (
  entity: Entity,
  gameState: GameState,
  model: LlamaContext
) => {
  try {
    const prompt = BEHAVIOR_PROMPT
      .replace('{dungeonLevel}', gameState.dungeonLevel.toString())
      .replace('{playerPos}', JSON.stringify(gameState.player.position))
      .replace('{npcPos}', JSON.stringify(entity.position))
      .replace('{npcType}', entity.aiType)
      .replace('{visibleEnemies}', gameState.entities.length.toString());
    const response = await model.completion(prompt);
    const action = JSON.parse(response);
    if (isValidAction(action)) {
      return action as Direction;
    }
  } catch (error) {
    console.warn('AI model failed, falling back to A* pathfinding');
    return aStarPathfind(entity.position, gameState.player.position);
  }
};

const isValidAction = (action: any): boolean => {
  return action?.direction?.x !== undefined && 
         action?.direction?.y !== undefined &&
         Math.abs(action.direction.x) <= 1 &&
         Math.abs(action.direction.y) <= 1;
};