// src/hooks/useInputHandler.ts
import { useEffect } from 'react';
import useGameStore from '../store/gameState';
import { Direction } from '../types/gameTypes';

const KEYBINDINGS: { [key: string]: Direction } = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

export const useInputHandler = () => {
  const currentTurn = useGameStore(state => state.currentTurn);
  const dispatch = useGameStore(state => state.dispatch);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentTurn !== 'player') return;

      const direction = KEYBINDINGS[e.key];
      if (!direction) return;

      e.preventDefault();
      
      const { player, dungeonMap } = useGameStore.getState();
      const newX = player.position[0] + direction.x;
      const newY = player.position[1] + direction.y;

      if (dungeonMap[newY]?.[newX]) {
        dispatch({ 
          type: 'moveEntity', 
          entityId: 'player-01', 
          direction 
        });
        dispatch({ type: 'advanceTurn' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTurn, dispatch]); 
};