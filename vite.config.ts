import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'assets',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    // Set open via environment variable: VITE_OPEN=true|1|yes|on (truthy) or false|0|no|off (falsy). Default: false.
    open: /^(true|1|yes|on)$/i.test(process.env.VITE_OPEN ?? ''),
  },
  resolve: {
  },
});
