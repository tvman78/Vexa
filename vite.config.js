import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the same build loads from Electron (file://) and Capacitor.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: { manualChunks: { three: ['three'], react: ['react', 'react-dom'] } },
    },
  },
});
