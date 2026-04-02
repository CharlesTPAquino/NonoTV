import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',  // Capacitor/Android precisa de caminhos relativos
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js'
  },
  build: {
    target: 'es2022',  // Modern browsers only for smaller bundles
    sourcemap: false,  // Disable source maps in production for smaller size
    minify: 'esbuild', // Faster minifier
    rollupOptions: {
      output: {
        manualChunks: {
          'hls': ['hls.js'],
          'lucide': ['lucide-react'],
          'react-vendor': ['react', 'react-dom'],
          'vendor': [ // Third-party libraries
            '@capacitor/core',
            '@capacitor/cli'
          ]
        },
        // Optimize chunk sizes
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Additional build optimizations
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // Inline assets under 4KB
  },
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
  },
  // Optimize Vite performance
  optimizeDeps: {
    include: ['react', 'react-dom', 'hls.js', 'lucide-react'],
    exclude: ['@capacitor/*']
  }
})
