import { useGameLoop } from './hooks/useGameLoop';
import { useInputHandler } from './hooks/useInputHandler';
import { GameCanvas } from './components/GameCanvas';
import { AINotification } from './components/AINotification';
import useGameStore from './store/gameState';
import { useEffect, useRef } from 'react';
import { wrap } from 'comlink';
import AIWorker from './workers/aiWorker/index.ts?worker'; 

const App = () => {
  const modelLoaded = useRef(false);
  useGameLoop();
  useInputHandler();
  useEffect(() => {
    if (modelLoaded.current) return;
    const worker = new AIWorker();
    const workerProxy = wrap<import('./workers/aiWorker').AIWorker>(worker);
    const loadModel = async () => {
      try {
        await workerProxy.init();
        useGameStore.getState().setModelReady(true);
        console.log('[App] AI model loaded successfully');
        modelLoaded.current = true;
      } catch (error) {
        console.error('[App] Failed to load AI model:', error);
      }
    };
    loadModel();
    return () => {
      worker.terminate(); 
    };
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