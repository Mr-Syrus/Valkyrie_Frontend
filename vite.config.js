import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
    server: {
        proxy: {
            '/api': {
                target: 'https://localhost:7232',
                changeOrigin: true,
                secure: false,
                ws: true, // Включаем поддержку WebSocket
            },
            '/swagger': {
                target: 'https://localhost:7232',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})
