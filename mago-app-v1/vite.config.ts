import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import react from '@vitejs/plugin-react';
import { comlink } from 'vite-plugin-comlink';
import topLevelAwait from 'vite-plugin-top-level-await';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    comlink(),
    wasm(),
    topLevelAwait(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/onnxruntime-web/dist/*.wasm',
          dest: 'wasm',
          rename: name => name.replace('ort-', '') 
        }
      ]
    })
  ],
  server: {
    hmr: { overlay: false }
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0
  },
  worker: {
    plugins: () => [wasm(), topLevelAwait(), comlink()], 
    format: 'es'
  },
  optimizeDeps: {
    include: ['@xenova/transformers'],
    exclude: ['onnxruntime-web']
  }
});