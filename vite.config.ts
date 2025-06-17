import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { comlink } from 'vite-plugin-comlink';

export default defineConfig({
  plugins: [
    react(),
    comlink()
  ],
  worker: {
    plugins: () => [comlink()],
    format: 'es' 
  },
  server: {
    host: true, 
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: true
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
    ]
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        'ai.worker': './src/workers/ai.worker.ts',
        'pathfinder.worker': './src/workers/pathfinder.worker.ts'
      }
    },
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['@webgpu/types', '@mlc-ai/web-llm']
  }
});