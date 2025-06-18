import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { comlink } from 'vite-plugin-comlink';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    comlink(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/onnxruntime-web/dist/ort-wasm*.wasm',
          dest: 'assets/wasm',
          rename: (name) => name.replace('ort-wasm', 'onnxruntime') 
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
    plugins: () => [comlink()],
    format: 'es'
  },
  optimizeDeps: {
    include: ['@xenova/transformers'],
    exclude: ['onnxruntime-web'] 
  }
});