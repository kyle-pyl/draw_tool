/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const bundleType = process.env.VITE_BUNDLE || 'full';
const isLite = bundleType === 'lite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __BUNDLE_TYPE__: JSON.stringify(bundleType),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    outDir: isLite ? 'dist/lite' : 'dist/full',
    rollupOptions: {
      external: isLite ? ['xlsx'] : [],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/unit/setup.ts'],
  },
})
