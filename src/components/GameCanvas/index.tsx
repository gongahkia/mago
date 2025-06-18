import { useEffect, useRef } from 'react';
import { AsciiRenderer } from './AsciiRenderer';
import { ColorSystem } from './ColorSystem';
import { useGameStore } from '../../store/gameState';

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useGameStore();
  
  useEffect(() => {
    const canvas = canvasRef.current!;
    const renderer = new AsciiRenderer(canvas);
    const colorSystem = new ColorSystem(canvas.getContext('2d')!);
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    const frame = () => {
      renderer.draw(gameState);
      requestAnimationFrame(frame);
    };
    
    frame();
    return () => window.removeEventListener('resize', resize);
  }, [gameState]);

  return <canvas ref={canvasRef} style={{ imageRendering: 'pixelated' }} />;
};