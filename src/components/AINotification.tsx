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
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '14px',
      textAlign: 'center',
      zIndex: 1000,
      backgroundColor: '#000000',
      border: '1px solid white',
      padding: '8px 12px'
    }}>
      <div style={{ whiteSpace: 'pre' }}>
        {
`
╔══════════════════════════╗
║      MAGO AI ACTIVE      ║
║     Processing Turn      ║
╚══════════════════════════╝
`
 }
      </div>
      
      <div style={{
        marginTop: '8px',
        fontSize: '12px',
        color: 'white'
      }}>
        <div style={{ whiteSpace: 'pre' }}>
          {'['}
          <span style={{
            display: 'inline-block',
            width: '16ch',
            backgroundColor: '#001100',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div 
              ref={progressRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                backgroundColor: 'white',
                transition: 'width 2s ease-out',
                width: '0%'
              }}
            />
            <span style={{ 
              position: 'relative', 
              zIndex: 1,
              color: 'transparent'
            }}>
              {'████████████████'}
            </span>
          </span>
          {']'}
        </div>
        <div style={{ marginTop: '4px', fontSize: '10px' }}>
          Calculating optimal strategy...
        </div>
      </div>
    </div>
  );
};