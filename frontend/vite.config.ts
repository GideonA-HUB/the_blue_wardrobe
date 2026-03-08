import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // Ensure relative paths for production deployment
  base: command === 'build' ? '/static/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
}))
