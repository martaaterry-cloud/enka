import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/enka/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['enka-icon.svg', 'favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Enka — Tu tiempo, a tu manera',
        short_name: 'Enka',
        description: 'Mi tiempo, organizado alrededor de mi vida real.',
        theme_color: '#18181B',
        background_color: '#09090B',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/enka/',
        scope: '/enka/',
        icons: [
          {
            src: 'enka-icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ],
})
