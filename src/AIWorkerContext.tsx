import React, { createContext, useContext, useRef, useEffect } from 'react';
import { wrap } from 'comlink';
import AIWorker from './workers/aiWorker/index.ts?worker';

const AIWorkerContext = createContext(null);

export const AIWorkerProvider = ({ children }) => {
  const workerRef = useRef(null);
  const workerProxyRef = useRef(null);

  if (!workerRef.current) {
    workerRef.current = new AIWorker();
    workerProxyRef.current = wrap(workerRef.current);
  }

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  return (
    <AIWorkerContext.Provider value={workerProxyRef.current}>
      {children}
    </AIWorkerContext.Provider>
  );
};

export const useAIWorker = () => useContext(AIWorkerContext);