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
      // Lite: mark xlsx as external so the dynamic import never resolves to a real chunk.
      // Full: let Rollup bundle xlsx lazily via code-splitting (no external list).
      external: isLite ? ['xlsx'] : [],
      output: isLite
        ? {}
        : {
            // Split xlsx into its own chunk so the main bundle stays lean.
            // The dynamic `import('xlsx')` in excel-parser.ts creates this split
            // automatically; this manualChunks entry guarantees a stable name.
            manualChunks: {
              xlsx: ['xlsx'],
            },
          },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/unit/setup.ts'],
    include: ['src/tests/unit/**/*.test.{ts,tsx}', 'src/tests/integration/**/*.test.{ts,tsx}'],
    exclude: ['src/tests/e2e/**', 'node_modules', '.opencode'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/core/**/*.ts', 'src/canvas/**/*.ts', 'src/io/**/*.ts', 'src/ui/**/*.tsx', 'src/modules/**/*.ts'],
      exclude: ['src/tests/**', 'src/vite-env.d.ts', 'src/main.tsx', 'src/App.tsx'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
