import { useEffect, useRef } from 'react';
import { wrap, transfer } from 'comlink';
import useGameStore from '../store/gameState';
import type { GameState, Entity } from '../types/gameTypes';

const TURN_DELAY = 100;

export const useGameLoop = () => {
  const currentTurn = useGameStore(state => state.currentTurn);
  const dispatch = useGameStore(state => state.dispatch);
  const workerRef = useRef<Worker | null>(null);
  const workerApi = useRef<ReturnType<typeof wrap<import('../workers/aiWorker').AIWorker>> | null>(null);

  useEffect(() => {
    const initializeWorker = async () => {
      if (!workerRef.current) {
        workerRef.current = new Worker(
          new URL('../workers/aiWorker', import.meta.url),
          { type: 'module' }
        );
        workerApi.current = wrap<import('../workers/aiWorker').AIWorker>(workerRef.current);
        await workerApi.current.init();
      }
    };

    initializeWorker();

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
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

        // Convert Map to Array for transfer
        const dungeonArray = Array.from(dungeonMap.entries());
        
        await Promise.all(
          aiEntities.map(async (entity) => {
            try {
              const action = await workerApi.current!.decideActionForEntity(
                Comlink.proxy(entity),
                transfer<GameState>({
                  entities,
                  dungeonMap: dungeonArray,
                  player
                }, [dungeonArray.buffer]) // Transfer buffer efficiently
              );
              
              dispatch({ 
                type: 'moveEntity', 
                entityId: entity.id, 
                direction: action 
              });
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