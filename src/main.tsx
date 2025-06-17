import React from 'react';
import ReactDOM from 'react-dom/client';
import { HUD } from './ui/HUD/HUD';
import { DialogueManager } from './ui/dialogues/DialogueManager';
import { useGameStore } from './game/state/store';
import { initWebGLContext } from './rendering/CanvasLayers';
import { SpriteBatch } from './rendering/SpriteBatch';
import { RNG } from './utils/rng';
import { gridToPixel } from './utils/grid-math';

// Game initialization
const rng = new RNG(Date.now());
let animationFrameId: number;
const TILE_SIZE = 64;

function App() {
  const [loading, setLoading] = React.useState(true);
  const [gameCanvas, setGameCanvas] = React.useState<HTMLCanvasElement | null>(null);
  const [glContext, setGlContext] = React.useState<WebGL2RenderingContext | null>(null);
  const [spriteBatch, setSpriteBatch] = React.useState<SpriteBatch | null>(null);
  
  // Zustand store hooks
  const {
    player,
    statusEffects,
    inventory,
    currentDialogue,
    updatePlayerPosition,
    setCurrentDialogue
  } = useGameStore();

  // Initialize WebGL context and game systems
  React.useEffect(() => {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    const gl = initWebGLContext(canvas);
    
    if (!gl) {
      console.error('Failed to initialize WebGL2 context');
      return;
    }

    const batch = new SpriteBatch(gl);
    setGameCanvas(canvas);
    setGlContext(gl);
    setSpriteBatch(batch);
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      batch.updateProjection(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Initial render
    batch.begin();
    batch.drawQuad(0, 0, canvas.width, canvas.height, [0.1, 0.1, 0.1, 1]);
    batch.end();
    
    setLoading(false);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      batch.dispose();
    };
  }, []);

  // Game loop
  React.useEffect(() => {
    if (!glContext || !spriteBatch) return;

    const gameLoop = () => {
      // Update game state
      const playerPos = gridToPixel(player.position.x, player.position.y, TILE_SIZE);
      
      // Render frame
      spriteBatch.begin();
      
      // Draw game world
      // (Add your dungeon rendering logic here)
      
      // Draw player
      spriteBatch.drawSprite(
        playerPos.px, playerPos.py,
        TILE_SIZE, TILE_SIZE,
        [1, 1, 1, 1] // Player sprite color
      );
      
      spriteBatch.end();
      
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [glContext, spriteBatch, player.position]);

  // Initialize service workers
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(
        new URL('../workers/service.worker.ts', import.meta.url),
        { scope: './', type: 'module' }
      ).then(registration => {
        console.log('ServiceWorker registration successful:', registration);
      }).catch(err => {
        console.error('ServiceWorker registration failed:', err);
      });
    }
  }, []);

  // Sample dialogue trigger
  React.useEffect(() => {
    const initialDialogue: DialogueEntry[] = [
      { speaker: 'Mago', message: 'The dungeon awakens...' },
      { speaker: 'System', message: 'Use arrow keys to move, right-click for actions' }
    ];
    
    setCurrentDialogue(initialDialogue);
  }, []);

  // Input handling
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const newPos = { ...player.position };
      
      switch(e.key) {
        case 'ArrowUp': newPos.y--; break;
        case 'ArrowDown': newPos.y++; break;
        case 'ArrowLeft': newPos.x--; break;
        case 'ArrowRight': newPos.x++; break;
      }
      
      updatePlayerPosition(newPos.x, newPos.y);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [player.position, updatePlayerPosition]);

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <h1>Loading Mago...</h1>
          <progress value={0.5} max={1} />
        </div>
      )}

      {currentDialogue && (
        <DialogueManager 
          dialogue={currentDialogue}
          onEnd={() => setCurrentDialogue(null)}
        />
      )}

      <HUD
        health={player.health}
        maxHealth={player.maxHealth}
        mana={player.mana}
        maxMana={player.maxMana}
        inventoryItems={inventory}
        statusEffects={statusEffects}
      />
    </>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

declare global {
  interface Window {
    webLLM: any;
  }
}