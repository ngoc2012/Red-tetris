// vitest.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: ['node_modules', 'dist', 'tmp', 'setupTests.js'],
    environment: 'jsdom', // Needed for React component tests
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'html'], // HTML for nice visual report
      thresholds: {
        // Requires 70% function, statement and line coverage
        functions: 70,
        statements: 70,
        lines: 70,
        branches: 50,
      }
    },
  },
})
