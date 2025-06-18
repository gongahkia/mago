import { useGameLoop } from './hooks/useGameLoop';
import { useInputHandler } from './hooks/useInputHandler';
import { GameCanvas } from './components/GameCanvas';
import { AINotification } from './components/AINotification';
import { useEffect } from 'react';
import useGameStore from './store/gameState';
import * as worker from './workers/aiWorker';

const App = () => {
  useGameLoop();
  useInputHandler();

  useEffect(() => {
    (async () => {
      try {
        await worker.init();
        useGameStore.getState().setModelReady(true);
        console.log('[App] AI model loaded successfully');
      } catch (error) {
        console.error('[App] Failed to load AI model:', error);
      }
    })();
  }, []); 

  return (
    <div style={{ 
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#1a1a1a'
    }}>
      <GameCanvas />
      <AINotification />
    </div>
  );
};

export default App;