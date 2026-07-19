import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { obfuscator } from 'vite-plugin-obfuscator';

export default defineConfig({
  plugins: [
    react(),
    obfuscator({
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.8,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: true,
      debugProtectionInterval: 3000,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      numbersToExpressions: true,
      renameGlobals: false,
      selfDefending: true,
      simplify: true,
      splitStrings: true,
      stringArray: true,
      stringArrayCallsTransform: true,
      stringArrayEncoding: ['base64'],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 3,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 5,
      stringArrayWrappersType: 'variable',
      stringArrayThreshold: 0.8,
      transformObjectKeys: true,
      unicodeEscapeSequence: false
    })
  ],
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        safari10: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          vendor: ['react', 'react-dom', 'zustand']
        }
      }
    }
  },
  server: {
    host: true
  }
});