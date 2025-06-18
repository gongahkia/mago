import { useGameLoop } from './hooks/useGameLoop';
import { useInputHandler } from './hooks/useInputHandler';
import { GameCanvas } from './components/GameCanvas';
import { AINotification } from './components/AINotification';
import useGameStore from './store/gameState';
import { useEffect } from 'react';
import { useAIWorker } from './AIWorkerContext';

const App = () => {
  useGameLoop();
  useInputHandler();
  const { worker, modelReady } = useAIWorker();

  useEffect(() => {
    if (modelReady) {
      useGameStore.getState().setModelReady(true);
      console.log('[App] AI model ready');
    }
  }, [modelReady]);

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