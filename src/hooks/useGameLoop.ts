import { useEffect } from 'react';
import { wrap } from 'comlink';
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
        const workerApi = wrap<import('../workers/aiWorker').AIWorker>(aiWorker);
        const currentState = useGameStore.getState();
        
        await workerApi.init(); 
        
        await Promise.all(
          entities
            .filter(e => e.aiType)
            .map(async (entity) => {
              const action = await workerApi.decideActionForEntity(entity, currentState);
              dispatch({ type: 'moveEntity', entityId: entity.id, direction: action });
            })
        );
      } catch (error) {
        console.error('AI processing error:', error);
      } finally {
        aiWorker?.terminate();
        dispatch({ type: 'advanceTurn' });
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