import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@api': resolve(__dirname, './src/api'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        taskpane: resolve(__dirname, 'src/taskpane/taskpane.html'),
      },
    },
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
})
