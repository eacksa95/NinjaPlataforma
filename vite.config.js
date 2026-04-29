import { defineConfig } from 'vite'

export default defineConfig({
  base: './',   // relative paths — works tanto en GitHub Pages como en iframe
  build: {
    outDir: 'dist',
  },
})
