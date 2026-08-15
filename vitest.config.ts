import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/__tests__/**/*.test.ts'],
    // The parity suite decodes all 147,644 cities against the raw JSON.
    testTimeout: 60_000,
  },
});
