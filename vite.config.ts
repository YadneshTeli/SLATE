import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173,
    strictPort: false, // Allow alternative ports if needed
    open: false,
    hmr: {
      port: 5174, // Use different port for HMR to avoid conflicts
      host: 'localhost',
      protocol: 'ws',
      overlay: true
    },
    // Enhanced CORS configuration
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://accounts.google.com',
        'https://firebaseapp.com',
        'https://slate-f7ba8.firebaseapp.com'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    }
  },
  // Force consistent base URL
  base: '/',
  // Clear screen setting
  clearScreen: false,
  // Enhanced build configuration
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  }
})
