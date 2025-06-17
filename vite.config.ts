import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { comlink } from 'vite-plugin-comlink';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    comlink()
  ],
  worker: {
    plugins: () => [comlink()],
    format: 'es'
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: true
    },
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-inline'", 
      'Service-Worker-Allowed': '/'
    },
    hmr: {
      clientPort: 3000, 
      protocol: 'ws',
      host: 'localhost'
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      external: ['@webgpu/types']
    },
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  optimizeDeps: {
    include: [
      '@mlc-ai/web-llm',
      'react-dom/client'
    ],
    exclude: ['@webgpu/types']
  }
});