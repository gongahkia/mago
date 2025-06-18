import { useEffect, useRef } from 'react';
import { wrap } from 'comlink';
import useGameStore from '../store/gameState';

const TURN_DELAY = 100;
let aiWorker: Worker | null = null;

export const useGameLoop = () => {
  const currentTurn = useGameStore(state => state.currentTurn);
  const dispatch = useGameStore(state => state.dispatch);
  const workerApi = useRef<ReturnType<typeof wrap<import('../workers/aiWorker').AIWorker>> | null>(null);

  useEffect(() => {
    const initializeWorker = async () => {
      if (!aiWorker) {
        aiWorker = new Worker(new URL('../workers/aiWorker', import.meta.url), {
          type: 'module'
        });
        workerApi.current = wrap<import('../workers/aiWorker').AIWorker>(aiWorker);
        await workerApi.current.init();
      }
    };

    initializeWorker();

    return () => {
      aiWorker?.terminate();
      aiWorker = null;
      workerApi.current = null;
    };
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const processAITurn = async () => {
      try {
        if (!workerApi.current) return;
        
        dispatch({ type: 'startAIThinking' });
        const { entities, dungeonMap, player } = useGameStore.getState();
        const aiEntities = entities.filter(e => e.aiType);

        if (aiEntities.length === 0) {
          dispatch({ type: 'advanceTurn' });
          return;
        }

        await Promise.all(
          aiEntities.map(async (entity) => {
            try {
              const action = await workerApi.current!.decideActionForEntity(
                entity, 
                Comlink.proxy({
                  entities,
                  dungeonMap: Array.from(dungeonMap.entries()),
                  player
                })
              );
              dispatch({ type: 'moveEntity', entityId: entity.id, direction: action });
            } catch (error) {
              console.error(`AI decision failed for ${entity.id}:`, error);
            }
          })
        );
      } finally {
        dispatch({ type: 'advanceTurn' });
        dispatch({ type: 'stopAIThinking' });
      }
    };

    if (currentTurn === 'ai') {
      timeout = setTimeout(processAITurn, TURN_DELAY);
    }

    return () => clearTimeout(timeout);
  }, [currentTurn, dispatch]);
};