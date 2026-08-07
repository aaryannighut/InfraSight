import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const certPath = path.resolve(__dirname, '../certs/cert.pem')
const keyPath = path.resolve(__dirname, '../certs/key.pem')
const hasSSL = fs.existsSync(certPath) && fs.existsSync(keyPath)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5175,
    host: true,
    ...(hasSSL ? {
      https: {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      }
    } : {}),
    proxy: {
      '/auth': { target: 'https://localhost:8000', changeOrigin: true, secure: false },
      '/detect': { target: 'https://localhost:8000', changeOrigin: true, secure: false },
      '/detections': { target: 'https://localhost:8000', changeOrigin: true, secure: false },
      '/stats': { target: 'https://localhost:8000', changeOrigin: true, secure: false },
      '/alerts': { target: 'https://localhost:8000', changeOrigin: true, secure: false },
      '/repair-plan': { target: 'https://localhost:8000', changeOrigin: true, secure: false },
      '/analytics': { target: 'https://localhost:8000', changeOrigin: true, secure: false },
      '/gamification': { target: 'https://localhost:8000', changeOrigin: true, secure: false },
      '/public': { target: 'https://localhost:8000', changeOrigin: true, secure: false },
      '/inspector': { target: 'https://localhost:8000', changeOrigin: true, secure: false },
      '/contractor': { target: 'https://localhost:8000', changeOrigin: true, secure: false },
      '/admin': { target: 'https://localhost:8000', changeOrigin: true, secure: false },
      '/sectors': { target: 'https://localhost:8000', changeOrigin: true, secure: false },
      '/health': { target: 'https://localhost:8000', changeOrigin: true, secure: false },
    }
  },
})
