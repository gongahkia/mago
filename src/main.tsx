import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import GameStateProvider from './store/gameState';
import { AIWorkerProvider } from './AIWorkerContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AIWorkerProvider>
      <App />
  </AIWorkerProvider>
);