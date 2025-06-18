import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useMemo,
  useState
} from 'react';
import { wrap } from 'comlink';
import AIWorker from './workers/aiWorker/index.ts?worker';

type AIWorkerContextType = {
  worker: any;
  modelReady: boolean;
};

const AIWorkerContext = createContext<AIWorkerContextType | null>(null);

export const AIWorkerProvider = ({ children }) => {
  const workerRef = useRef<any>(null);
  const workerProxyRef = useRef<any>(null);
  const [modelReady, setModelReady] = useState(false);

  if (!workerRef.current) {
    workerRef.current = new AIWorker();
    workerProxyRef.current = wrap(workerRef.current);
  }

  useEffect(() => {
    workerProxyRef.current.init().then(() => {
      setModelReady(true);
      console.log('[AIWorkerProvider] Model loaded');
    });
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const value = useMemo(
    () => ({
      worker: workerProxyRef.current,
      modelReady
    }),
    [modelReady]
  );

  return (
    <AIWorkerContext.Provider value={value}>
      {children}
    </AIWorkerContext.Provider>
  );
};

export const useAIWorker = () => {
  const ctx = useContext(AIWorkerContext);
  if (!ctx) throw new Error('useAIWorker must be used within an AIWorkerProvider');
  return ctx;
};