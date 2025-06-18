import { useEffect, useRef } from 'react';
import useGameStore from '../store/gameState';

export const AINotification = () => {
  const isAIThinking = useGameStore(state => state.isAIThinking);
  const modelReady = useGameStore(state => state.modelReady);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((isAIThinking || !modelReady) && progressRef.current) {
      progressRef.current.style.width = '0%';
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.width = '100%';
        }
      }, 10);
    }
  }, [isAIThinking, modelReady]);

  if (modelReady && !isAIThinking) return null;

  const message = !modelReady
    ? `
╔═══════════════════════════╗
║      MAGO IS LOADING      ║
║      Wait for model       ║
╚═══════════════════════════╝
`
    : `
╔══════════════════════════╗
║     MAGO IS THINKING     ║
║       Taking Turn        ║
╚══════════════════════════╝
`;

  const barLabel = !modelReady
    ? 'Loading model...'
    : 'Calculating optimal strategy...';

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
        {message}
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
                transition: modelReady ? 'width 2s ease-out' : 'width 4s ease-in',
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
          {barLabel}
        </div>
      </div>
    </div>
  );
};