
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
  // Force production-like behavior in dev mode (makes debugging hard!)
  server: {
    sourcemapIgnoreList: () => true,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  }
});