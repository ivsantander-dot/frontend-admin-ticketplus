import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/frontend-admin-ticketplus/', // DEBE estar entre barras (ej: /ticketplus-admin/)
  server: {
    port: 5173 // Puerto local para el admin
  }
})