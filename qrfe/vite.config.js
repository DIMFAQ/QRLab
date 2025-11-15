import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [react()],
  server: {
    // TAMBAHKAN host: '0.0.0.0' DI SINI
    host: '0.0.0.0', 
    https: false, 
    port: 5173 
  },
})