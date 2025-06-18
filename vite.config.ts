import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { comlink } from 'vite-plugin-comlink'; 

export default defineConfig({
  plugins: [
    react(),
    comlink() 
  ],
  server: {
    hmr: { overlay: false },
    watch: { usePolling: true },
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
    sourcemap: 'hidden',
    rollupOptions: {
      plugins: [
        wasm() 
      ]
    }
  },
  resolve: {
    alias: { '@': '/src' }
  },
  worker: {
    plugins: () => [comlink()] 
  },
  optimizeDeps: {
    include: [
      'onnxruntime-web/wasm', 
      '@xenova/transformers'
    ],
    exclude: ['@xenova/transformers']
  }
});