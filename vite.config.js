import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      // PROXY INTELIGENTE: Redireciona chamadas de vídeos para evitar bloqueios de CORS
      '/proxy/hls': {
        target: 'http://localhost:5173', // Placeholder
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/hls/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            proxyReq.setHeader('Referer', 'http://iptv-smarters.com'); // Simula um player oficial
          });
        }
      }
    }
  }
})
