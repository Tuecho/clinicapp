import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts:['nuriacheca.es'],
    proxy: {
      '/api': {
        target: 'http://api_clinic:3000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  publicDir: 'public'
})
