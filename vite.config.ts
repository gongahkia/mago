import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: true
    },
    proxy: {
      '/Xenova': {
        target: 'https://huggingface.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/Xenova/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: 'hidden' 
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});