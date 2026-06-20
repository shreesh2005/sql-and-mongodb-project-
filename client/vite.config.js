import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/sql-and-mongodb-project-/', // Base path matching your GitHub Pages repository name
  build: {
    outDir: '../docs', // Output build directory at root of repo for GitHub Pages
    emptyOutDir: true  // Cleans the docs folder before rebuilding
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
