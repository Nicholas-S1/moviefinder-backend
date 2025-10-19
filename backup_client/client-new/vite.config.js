import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ The correct Vite config for your app
export default defineConfig({
  plugins: [react()],
  root: '.', // Tell Vite to use the current folder as root
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    open: true,
  },
})
