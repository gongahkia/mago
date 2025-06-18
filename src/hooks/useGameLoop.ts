// src/hooks/useGameLoop.ts
import { useEffect } from 'react';
import { wrap } from 'comlink';
import useGameStore from '../store/gameState';

const TURN_DELAY = 100;

export const useGameLoop = () => {
  const currentTurn = useGameStore(state => state.currentTurn);
  const dispatch = useGameStore(state => state.dispatch);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let aiWorker: Worker | null = null;

    const processAITurn = async () => {
      try {
        const { entities, dungeonMap } = useGameStore.getState();
        const aiEntities = entities.filter(e => e.aiType);
        
        if (aiEntities.length === 0) {
          dispatch({ type: 'advanceTurn' });
          return;
        }

        aiWorker = new Worker(new URL('../workers/aiWorker', import.meta.url), {
          type: 'module'
        });
        const workerApi = wrap<import('../workers/aiWorker').AIWorker>(aiWorker);
        
        await workerApi.init();

        await Promise.all(
          aiEntities.map(async (entity) => {
            try {
              const action = await workerApi.decideActionForEntity(entity, { 
                ...useGameStore.getState(),
                dungeonMap 
              });
              dispatch({ type: 'moveEntity', entityId: entity.id, direction: action });
            } catch (error) {
              console.error(`AI decision failed for ${entity.id}:`, error);
            }
          })
        );
      } catch (error) {
        console.error('AI turn processing failed:', error);
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
  }, [currentTurn, dispatch]); 
};