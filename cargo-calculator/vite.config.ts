import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/3d-cargo-calculator/',
  plugins: [react()],
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      mangle: { safari10: true },
      format: { comments: false }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor': ['react', 'react-dom', 'zustand'],
          'pdf': ['jspdf', 'html2canvas', 'dompurify'],
          'calculations': ['src/utils/calculations.ts'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/\.(glb|gltf)$/.test(assetInfo.name)) {
            return `assets/models/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|ttf|eot)$/.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    modulePreload: { polyfill: false }
  },
  server: { host: true },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'react', 'react-dom', 'zustand'],
    exclude: ['jspdf', 'html2canvas', 'dompurify']
  }
});