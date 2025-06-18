import { useEffect, useRef } from 'react';
import useGameStore from '../store/gameState';

export const AINotification = () => {
  const isAIThinking = useGameStore(state => state.isAIThinking);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAIThinking && progressRef.current) {
      progressRef.current.style.width = '0%';
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.width = '100%';
        }
      }, 10);
    }
  }, [isAIThinking]);

  if (!isAIThinking) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      color: '#00FF00',
      fontFamily: 'monospace',
      textAlign: 'center',
      zIndex: 1000
    }}>
      <div>AI THINKING...</div>
      <div style={{
        width: '200px',
        height: '4px',
        backgroundColor: '#1a1a1a',
        marginTop: '8px',
        overflow: 'hidden'
      }}>
        <div ref={progressRef} style={{
          height: '100%',
          backgroundColor: '#00FF00',
          transition: 'width 100ms linear',
          width: '0%'
        }} />
      </div>
    </div>
  );
};