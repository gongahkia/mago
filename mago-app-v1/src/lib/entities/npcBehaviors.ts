import { Entity } from './Entity';
import { GameState } from '../../types/gameTypes';
import { Direction, Position } from '../../types/gameTypes';
import { aStarPathfind } from '../utilities/pathfinding';

export const processNPCAI = (entity: Entity, state: GameState): Direction => {
  if (!entity.aiType) return { x: 0, y: 0 };

  switch (entity.aiType) {
    case 'hostile':
      return handleHostileBehavior(entity, state);
    case 'passive':
      return handlePassiveBehavior(entity, state);
    default:
      return wanderRandomly(entity, state);
  }
};

const handleHostileBehavior = (entity: Entity, state: GameState): Direction => {
  if (entity.canSee(state.player.position, state.dungeonMap)) {
    return aStarPathfind(
      entity.position,
      state.player.position,
      (pos) => state.dungeonMap[pos[1]]?.[pos[0]] ?? false
    ) || wanderRandomly(entity, state);
  }
  return wanderRandomly(entity, state);
};

const handlePassiveBehavior = (entity: Entity, state: GameState): Direction => {
  if (entity.canSee(state.player.position, state.dungeonMap)) {
    return fleeFromPosition(entity.position, state.player.position, state);
  }
  return wanderRandomly(entity, state);
};

const wanderRandomly = (entity: Entity, state: GameState): Direction => {
  const directions = [
    { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
  ].filter(dir => {
    const newPos: Position = [
      entity.position[0] + dir.x,
      entity.position[1] + dir.y
    ];
    return state.dungeonMap[newPos[1]]?.[newPos[0]];
  });

  return directions[Math.floor(Math.random() * directions.length)] || { x: 0, y: 0 };
};

const fleeFromPosition = (current: Position, from: Position, state: GameState): Direction => {
  const oppositeDir = {
    x: Math.sign(current[0] - from[0]),
    y: Math.sign(current[1] - from[1])
  };

  const preferredPos: Position = [
    current[0] + oppositeDir.x,
    current[1] + oppositeDir.y
  ];

  return state.dungeonMap[preferredPos[1]]?.[preferredPos[0]] 
    ? { x: oppositeDir.x, y: oppositeDir.y }
    : wanderRandomly(new Entity({ ...entityBaseConfig, position: current }), state);
};

const entityBaseConfig = {
  id: '',
  char: '?',
  color: '#FFF',
  position: [0,0] as Position
};