import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-audio-cache',
              rangeRequests: true,
              cacheableResponse: { statuses: [0, 200, 206] },
              expiration: { maxEntries: 114, maxAgeSeconds: 31536000 }
            }
          }
        ]
      },
      manifest: {
        name: 'Quran Display',
        short_name: 'Quran',
        display: 'standalone',
        theme_color: '#000000',
        background_color: '#000000'
      }
    })
  ]
});
