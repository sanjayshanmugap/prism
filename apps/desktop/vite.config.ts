import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { join } from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': join(__dirname, 'src/renderer'),
      '@prism/shared': join(__dirname, '../../packages/shared/src'),
    },
  },
  server: {
    port: 5173,
  },
});