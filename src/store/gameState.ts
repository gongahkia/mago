import { create } from 'zustand';
import { GameState, GameAction, Entity, Player } from '../types/gameTypes';
import { DungeonGenerator } from '../lib/generators/DungeonGenerator';

const INITIAL_PLAYER: Player = {
  id: 'player-01',
  char: '@',
  color: '#FFFFFF',
  position: [0, 0],
  inventory: [],
  experience: 0,
};

const useGameStore = create<GameState & { 
  dispatch: (action: GameAction) => void 
}>((set) => ({
  dungeonLevel: 1,
  player: INITIAL_PLAYER,
  entities: [],
  currentTurn: 'player',
  dungeonMap: new DungeonGenerator().generateLevel(1),
  
  dispatch: (action) => set((state) => {
    switch (action.type) {
      case 'moveEntity':
        return moveEntity(state, action);
      case 'resetGame':
        return { 
          ...INITIAL_STATE,
          dungeonMap: new DungeonGenerator().generateLevel(1)
        };
      case 'advanceTurn':
        return { ...state, currentTurn: state.currentTurn === 'player' ? 'ai' : 'player' };
      default:
        return state;
    }
  }),
}));

const moveEntity = (state: GameState, action: { entityId: string; direction: Direction }) => {
  const { entities, player } = state;
  const target = entities.find(e => e.id === action.entityId) || player;
  const newPos: [number, number] = [
    target.position[0] + action.direction.x,
    target.position[1] + action.direction.y
  ];
  
  return {
    ...state,
    [target === player ? 'player' : 'entities']: {
      ...target,
      position: newPos
    }
  };
};

const INITIAL_STATE = {
  dungeonLevel: 1,
  player: INITIAL_PLAYER,
  entities: [],
  currentTurn: 'player' as const,
};

export default useGameStore;