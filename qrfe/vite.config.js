import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// HTTPS gratis dengan self-signed certificate (untuk akses kamera)
export default defineConfig({
  plugins: [
    react(),
    mkcert() // Auto-generate SSL certificate
  ],
  server: { 
    https: true, // Enable HTTPS
    host: '0.0.0.0', // Binding ke semua network interfaces
    port: 5173,
    strictPort: true,
    cors: true,
    // Proxy API requests ke backend Laravel (HTTP)
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
