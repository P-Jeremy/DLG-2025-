import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { version } from './package.json';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icons/pwa/icon-192.png',
          'icons/pwa/icon-512.png',
          'icons/pwa/icon-512-maskable.png',
          'icons/pwa/apple-touch-icon.png',
        ],
        manifest: {
          name: 'DLG',
          short_name: 'DLG',
          start_url: '/',
          display: 'standalone',
          orientation: 'any',
          background_color: '#f5f5f5',
          theme_color: '#1976d2',
          description: `Chansons DLG v${version}`,
          icons: [
            {
              src: '/icons/pwa/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/pwa/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/icons/pwa/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/meta'),
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 2 * 60 * 60,
                },
                broadcastUpdate: {
                  channelName: 'api-updates',
                  options: {},
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    define: {
      'window.__ENV__': JSON.stringify({
        VITE_API_URL: env.VITE_API_URL ?? '',
      }),
    },
    server: {
      proxy: {
        '/api': 'http://localhost:3001',
      },
    },
  };
});