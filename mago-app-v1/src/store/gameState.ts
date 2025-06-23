import { create } from 'zustand';
import { GameState, GameAction, Entity, Player, Direction } from '../types/gameTypes';
import { DungeonGenerator } from '../lib/generators/DungeonGenerator';

const INITIAL_PLAYER_POSITION: [number, number] = [1, 1];

const INITIAL_PLAYER: Player = {
  id: 'player-01',
  char: '@',
  color: '#FFFFFF',
  position: INITIAL_PLAYER_POSITION,
  inventory: [],
  experience: 0,
};

const spawnEntities = (dungeonMap: boolean[][]): Entity[] => {
  const entities: Entity[] = [];
  let entityId = 0;

  const walkablePositions: [number, number][] = [];
  for (let y = 0; y < dungeonMap.length; y++) {
    for (let x = 0; x < dungeonMap[y].length; x++) {
      if (dungeonMap[y][x]) {
        walkablePositions.push([x, y]);
      }
    }
  }

  const numNPCs = Math.floor(Math.random() * 3) + 3;
  for (let i = 0; i < numNPCs && walkablePositions.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * walkablePositions.length);
    const [x, y] = walkablePositions.splice(randomIndex, 1)[0];

    entities.push({
      id: `npc-${entityId++}`,
      char: Math.random() < 0.5 ? 'o' : 'T',
      color: Math.random() < 0.5 ? '#00FF00' : '#FF4444',
      position: [x, y],
      aiType: 'hostile',
      health: 10
    });
  }

  return entities;
};

const moveEntity = (state: GameState, action: { entityId: string; direction: Direction }) => {
  const { entities, player, dungeonMap } = state;
  const target = action.entityId === 'player-01' ? player : entities.find(e => e.id === action.entityId);

  if (!target) return state;

  const newX = target.position[0] + action.direction.x;
  const newY = target.position[1] + action.direction.y;

  if (!dungeonMap[newY]?.[newX]) {
    return state;
  }

  const newPos: [number, number] = [newX, newY];

  if (target === player) {
    return {
      ...state,
      player: { ...player, position: newPos }
    };
  } else {
    return {
      ...state,
      entities: entities.map(e =>
        e.id === action.entityId ? { ...e, position: newPos } : e
      )
    };
  }
};

const INITIAL_STATE = {
  dungeonLevel: 1,
  player: INITIAL_PLAYER,
  entities: [],
  currentTurn: 'player' as const,
  isAIThinking: false,
  modelReady: false,
};

const useGameStore = create<GameState & {
  dispatch: (action: GameAction) => void,
  modelReady: boolean,
  setModelReady: (ready: boolean) => void
}>((set) => {
  const initialMap = new DungeonGenerator().generateLevel(1);
  const initialEntities = spawnEntities(initialMap);

  return {
    dungeonLevel: 1,
    player: INITIAL_PLAYER,
    entities: initialEntities,
    currentTurn: 'player',
    dungeonMap: initialMap,
    isAIThinking: false,
    modelReady: false,

    setModelReady: (ready: boolean) => set({ modelReady: ready }),

    dispatch: (action) => set((state) => {
      switch (action.type) {
        case 'moveEntity':
          return moveEntity(state, action);
        case 'resetGame':
          const newMap = new DungeonGenerator().generateLevel(1);
          return {
            ...INITIAL_STATE,
            dungeonMap: newMap,
            entities: spawnEntities(newMap),
            modelReady: state.modelReady,
          };
        case 'advanceTurn':
          return { ...state, currentTurn: state.currentTurn === 'player' ? 'ai' : 'player' };
        case 'startAIThinking':
          return { ...state, isAIThinking: true };
        case 'stopAIThinking':
          return { ...state, isAIThinking: false };
        default:
          return state;
      }
    }),
  };
});

export default useGameStore;