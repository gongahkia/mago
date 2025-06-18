import { useGameLoop } from './hooks/useGameLoop';
import { useInputHandler } from './hooks/useInputHandler';
import { GameCanvas } from './components/GameCanvas';

const App = () => {
  useGameLoop();
  useInputHandler();

  return (
    <div style={{ 
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#1a1a1a'
    }}>
      <GameCanvas />
    </div>
  );
};

export default App;