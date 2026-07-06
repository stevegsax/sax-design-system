import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// One screenshot per story in the built Storybook. Baselines live in
// tokens.spec.js-snapshots/ and are committed; a diff means a token's
// rendered appearance changed. Playwright suffixes baselines with the
// platform, so they only compare against runs on the same OS.
let index;
try {
  index = JSON.parse(readFileSync(new URL('../../storybook-static/index.json', import.meta.url), 'utf8'));
} catch {
  throw new Error('storybook-static/index.json not found — run via `npm run test:visual`, which builds Storybook first');
}

const stories = Object.values(index.entries).filter((entry) => entry.type === 'story');

for (const story of stories) {
  test(story.id, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await expect(page.locator('.token-catalog')).toBeVisible();
    await expect(page).toHaveScreenshot(`${story.id}.png`, { fullPage: true });
  });
}
