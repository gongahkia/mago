import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { comlink } from 'vite-plugin-comlink';

export default defineConfig({
  plugins: [
    react(),
    comlink()
  ],
  worker: {
    plugins: () => [comlink()]
  },
  server: {
    host: '0.0.0.0', 
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: true  
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets', 
    sourcemap: true
  }
});
