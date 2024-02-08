import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({ include: '**/*.tsx' }),
    nodePolyfills({
      globals: {
        global: true,
        Buffer: true,
        process: true
      },
      include: ['buffer', 'process'],
      protocolImports: false
    })
  ],
  server: {
    watch: {
      usePolling: true
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@codemirror': path.resolve(__dirname, 'node_modules/@codemirror/')
    }
  }
})
