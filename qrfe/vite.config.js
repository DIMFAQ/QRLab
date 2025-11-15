import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert' // Hapus tanda comment di sini

export default defineConfig({
  plugins: [
    react(),
    mkcert() // Tambahkan mkcert() di sini
  ],
  server: {
    host: '0.0.0.0', 
    https: true, // Ubah dari false menjadi true
    port: 5173 
  },
})