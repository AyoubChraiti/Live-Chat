import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3001,
    host: true,
    open: true,
    strictPort: true, // Fail if port 3001 is not available
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})