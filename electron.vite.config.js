import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
      lib: { entry: 'electron/main/index.js' },
      rollupOptions: {
        external: ['electron-store', 'gray-matter'],
      },
    },
  },
  preload: {
    build: {
      outDir: 'dist/preload',
      lib: { entry: 'electron/preload/index.js', formats: ['cjs'], fileName: () => 'index.js' },
    },
  },
  renderer: {
    root: '.',
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'dist/renderer',
      rollupOptions: { input: 'index.html' },
    },
  },
})
