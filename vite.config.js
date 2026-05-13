import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],


  // http://192.168.1.53:5000
  // https://hrms-v-2-5-backend.vercel.app/
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['https://hrmsv2.infinityarthvishva.com/'],
    proxy: {
      '/api': {
        target: 'https://hrms-v-2-5-backend.vercel.app/',
        changeOrigin: true,
      },
    },
  },

  preview: {
    host: true,
    allowedHosts: ['https://hrmsv2.infinityarthvishva.com/'],
  }
})