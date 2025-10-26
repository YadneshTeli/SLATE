import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173,
    strictPort: true, // Force port 5173 to avoid WebSocket connection mismatches
    open: false,
    hmr: {
      port: 5173, // Use same port for HMR to avoid conflicts
      host: 'localhost',
      protocol: 'ws',
      overlay: true,
      clientPort: 5173, // Ensure client connects to correct port
      timeout: 30000 // Increase timeout for better reliability
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
  // Enhanced development settings
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom/client'
    ],
    esbuildOptions: {
      resolveExtensions: ['.web.js', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
  },
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
