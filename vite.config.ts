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
    host: true, // or '0.0.0.0'
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: true
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      // Add your WSL2 or LAN IP if needed, e.g.:
      // '172.24.0.2'
    ]
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
});