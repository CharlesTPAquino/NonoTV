import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js'
  },
  build: {
    // CORREÇÃO CRÍTICA: era 'es2022' — Firestick usa Chromium 88-94 e não suporta ES2022
    target: ['chrome88', 'safari14'],

    sourcemap: false,
    minify: 'esbuild',

    // CORREÇÃO: remove todos os console.log e debugger em produção automaticamente
    // Mas mantém logs de [Auth] para debug
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },

    rollupOptions: {
      output: {
        manualChunks: {
          'hls': ['hls.js'],
          'lucide': ['lucide-react'],
          'react-vendor': ['react', 'react-dom'],
          'vendor': ['@capacitor/core'],
          // AI separado — só carrega quando necessário
          'ai': ['@google/generative-ai'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  server: {
    host: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'hls.js', 'lucide-react'],
    exclude: ['@capacitor/*']
  }
})