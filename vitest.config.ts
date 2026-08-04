import { defineConfig } from 'vitest/config'
import path from 'node:path'

/**
 * Minimal Vitest setup for the pure frontend helpers under `inertia/utils/`.
 *
 * This is intentionally a narrow seam: only deterministic, framework-free
 * helpers (e.g. `cloneBlock`) are unit-tested here. The rest of the Inertia
 * app is covered by the Japa browser E2E suite.
 */
export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'inertia'),
      '@generated': path.resolve(__dirname, '.adonisjs/client'),
      '#types': path.resolve(__dirname, 'app/types'),
    },
  },
  test: {
    environment: 'node',
    include: ['inertia/utils/**/*.spec.ts'],
  },
})
