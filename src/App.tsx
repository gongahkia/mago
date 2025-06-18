import { useGameLoop } from './hooks/useGameLoop';
import { useInputHandler } from './hooks/useInputHandler';
import { GameCanvas } from './components/GameCanvas';
import { AINotification } from './components/AINotification';
import useGameStore from './store/gameState';
import { useEffect } from 'react';
import { wrap } from 'comlink';
import AIWorker from './workers/aiWorker/index.ts?worker'; 

const App = () => {
  useGameLoop();
  useInputHandler();

  useEffect(() => {
    (async () => {
      try {
        const worker = new AIWorker(); 
        const workerProxy = wrap<import('./workers/aiWorker').AIWorker>(worker); 
        useEffect(() => {
          (async () => {
            await workerProxy.init();
            useGameStore.getState().setModelReady(true);
          })();
        }, []);
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