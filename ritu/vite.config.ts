import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.1.0') },
  // Tailwind runs through its Vite plugin; don't pick up a parent folder's postcss.config
  css: { postcss: {} },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      // registered by hand in main.tsx, on web only (never inside Capacitor)
      injectRegister: false,
      registerType: 'autoUpdate',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,png,webmanifest}'],
      },
      manifest: {
        name: 'Ritu',
        short_name: 'Ritu',
        description: 'Period tracker for the whole family',
        lang: 'en',
        start_url: '/',
        display: 'standalone',
        background_color: '#F3F2F7',
        theme_color: '#3B3486',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      devOptions: { enabled: false },
    }),
  ],
});
