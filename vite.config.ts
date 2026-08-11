import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Karate Training Log',
        short_name: 'Karate OS',
        description: 'Training log, competition tracking, and prep for karate athletes.',
        theme_color: '#1a1a1c',
        background_color: '#1a1a1c',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Only pre-cache the app shell (JS/CSS/fonts/icons) so the last
        // successfully loaded UI works offline. Deliberately NOT caching
        // API responses (Supabase REST/Edge Function calls) - training
        // data must always come from the network, never a stale cache.
        globPatterns: ['**/*.{js,css,html,woff,woff2,png,svg}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
