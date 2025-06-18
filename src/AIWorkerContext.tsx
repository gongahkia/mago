import React, { createContext, useContext, useRef, useEffect, useMemo } from 'react';
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

  const value = useMemo(() => workerProxyRef.current, []);

  return (
    <AIWorkerContext.Provider value={value}>
      {children}
    </AIWorkerContext.Provider>
  );
};

export const useAIWorker = () => {
  const ctx = useContext(AIWorkerContext);
  if (!ctx) throw new Error("useAIWorker must be used within an AIWorkerProvider");
  return ctx;
};