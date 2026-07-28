import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/visual',
  fullyParallel: true,
  // HTML report for visual review: `npx playwright show-report` opens
  // per-story expected/actual/diff with side-by-side and slider views.
  reporter: [['list'], ['html', { open: 'never' }]],
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
