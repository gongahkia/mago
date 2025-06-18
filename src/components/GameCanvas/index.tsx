import { useEffect, useRef } from 'react';
import { AsciiRenderer } from './AsciiRenderer';
import useGameStore from '../../store/gameState';

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<AsciiRenderer | null>(null);
  
  const dungeonMap = useGameStore(state => state.dungeonMap);
  const player = useGameStore(state => state.player);
  const entities = useGameStore(state => state.entities);

  useEffect(() => {
    const canvas = canvasRef.current!;
    rendererRef.current = new AsciiRenderer(canvas);
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    let animationFrameId: number;
    const render = () => {
      rendererRef.current?.draw({ dungeonMap, player, entities });
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [dungeonMap, player, entities]); 

  return <canvas ref={canvasRef} style={{ imageRendering: 'pixelated' }} />;
};