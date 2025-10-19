import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy API calls to backend to avoid CORS in development
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // Remove /api prefix when forwarding to backend
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
