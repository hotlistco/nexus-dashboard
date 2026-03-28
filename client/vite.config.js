import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0  // never inline assets as base64 — TV file system handles them fine
  },
  resolve: {
    preserveSymlinks: false  // resolve symlinks so weather-icons copies correctly
  }
});
