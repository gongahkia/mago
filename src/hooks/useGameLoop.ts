import { useEffect } from 'react';
import useGameStore from '../store/gameState';
import { GameState } from '../types/gameTypes';

const TURN_DELAY = 100;

export const useGameLoop = () => {
  const currentTurn = useGameStore(state => state.currentTurn);
  const entities = useGameStore(state => state.entities);
  const dispatch = useGameStore(state => state.dispatch);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const processAITurn = async () => {
      const aiWorker = new Worker(new URL('../workers/aiWorker', import.meta.url), {
        type: 'module'
      });

      const currentState = useGameStore.getState();
      
      for (const entity of entities.filter(e => e.aiType)) {
        try {
          const action = await aiWorker.decideActionForEntity(entity, currentState);
          dispatch({ type: 'moveEntity', entityId: entity.id, direction: action });
        } catch (error) {
          console.error('AI decision failed:', error);
        }
      }

      dispatch({ type: 'advanceTurn' });
      aiWorker.terminate();
    };

    if (currentTurn === 'ai') {
      timeout = setTimeout(processAITurn, TURN_DELAY);
    }

    return () => clearTimeout(timeout);
  }, [currentTurn, entities, dispatch]);
};