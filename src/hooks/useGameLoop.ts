import { useEffect } from 'react';
import useGameStore from '../store/gameState';

const TURN_DELAY = 100;

export const useGameLoop = () => {
  const currentTurn = useGameStore(state => state.currentTurn);
  const entities = useGameStore(state => state.entities);
  const dispatch = useGameStore(state => state.dispatch);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let aiWorker: Worker | null = null;

    const processAITurn = async () => {
      if (currentTurn !== 'ai') return; 
      
      aiWorker = new Worker(new URL('../workers/aiWorker', import.meta.url), {
        type: 'module'
      });

      try {
        const currentState = useGameStore.getState();
        await Promise.all(
          entities
            .filter(e => e.aiType)
            .map(async (entity) => {
              const action = await aiWorker!.decideActionForEntity(entity, currentState);
              dispatch({ type: 'moveEntity', entityId: entity.id, direction: action });
            })
        );
      } catch (error) {
        console.error('AI processing error:', error);
      } finally {
        dispatch({ type: 'advanceTurn' });
        aiWorker?.terminate();
      }
    };

    if (currentTurn === 'ai') {
      timeout = setTimeout(processAITurn, TURN_DELAY);
    }

    return () => {
      clearTimeout(timeout);
      aiWorker?.terminate();
    };
  }, [currentTurn, entities, dispatch]);
};