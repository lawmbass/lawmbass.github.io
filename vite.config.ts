import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the static build works at a user site root (lawmbass.github.io)
// or a project subpath (lawmbass.github.io/portfolio) without changes.
export default defineConfig({
  base: './',
  plugins: [react()],
  // Footer year, fixed at build time so the prerendered HTML and the client always agree.
  define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
})
