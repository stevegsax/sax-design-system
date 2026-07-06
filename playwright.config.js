import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/visual',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:6006',
    viewport: { width: 1200, height: 800 },
    // Pin the color profile so oklch rendering doesn't vary with the host display.
    launchOptions: { args: ['--force-color-profile=srgb'] },
  },
  webServer: {
    command: 'npx http-server storybook-static --port 6006 --silent',
    url: 'http://127.0.0.1:6006/index.json',
    reuseExistingServer: true,
  },
});
