import { useEffect } from 'react';
import useGameStore from '../store/gameState';
import { GameState } from '../types/gameTypes';

const TURN_DELAY = 100; 

export const useGameLoop = () => {
  const { currentTurn, entities, dispatch } = useGameStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const processAITurn = async () => {
      const aiWorker = new Worker(new URL('../workers/aiWorker', import.meta.url), {
        type: 'module'
      });

      for (const entity of entities.filter(e => e.aiType)) {
        const action = await aiWorker.decideActionForEntity(entity, useGameStore.getState());
        dispatch({ type: 'moveEntity', entityId: entity.id, direction: action });
      }
      
      dispatch({ type: 'advanceTurn' });
      aiWorker.terminate();
    };

    if (currentTurn === 'ai') {
      interval = setTimeout(processAITurn, TURN_DELAY);
    }

    return () => clearTimeout(interval);
  }, [currentTurn, entities, dispatch]);
};