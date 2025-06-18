import { useEffect } from 'react';
import useGameStore from '../store/gameState';
import { useAIWorker } from '../AIWorkerContext';

const TURN_DELAY = 100;

export const useGameLoop = () => {
  const currentTurn = useGameStore(state => state.currentTurn);
  const dispatch = useGameStore(state => state.dispatch);
  const { worker: aiWorker } = useAIWorker();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const processAITurn = async () => {
      if (!aiWorker) return;
      
      try {
        dispatch({ type: 'startAIThinking' });
        const { entities, dungeonMap } = useGameStore.getState();
        const aiEntities = entities.filter(e => e.aiType);
        
        if (aiEntities.length === 0) {
          dispatch({ type: 'advanceTurn' });
          return;
        }

        await Promise.all(
          aiEntities.map(async (entity) => {
            try {
              const action = await aiWorker.decideActionForEntity(entity, { 
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
        dispatch({ type: 'stopAIThinking' });
      }
    };

    if (currentTurn === 'ai') {
      timeout = setTimeout(processAITurn, TURN_DELAY);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [currentTurn, dispatch, aiWorker]); 
};