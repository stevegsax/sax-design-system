// Render-check for the design-sync bundle: load every standalone HTML page
// in headless Chromium and report 404s, JS errors, the magenta diagnostic,
// and unresolved token variables. Templates (.dc.html) are skipped — they
// need the claude.ai app runtime.
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BUNDLE = process.argv[2];
const PORT = 8123;

const pages = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.card.html') || p.endsWith('index.html')) {
      pages.push(path.relative(BUNDLE, p));
    }
  }
};
walk(BUNDLE);

const { createServer } = await import('http');
const { readFileSync } = await import('node:fs');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/markdown' };
const server = createServer((req, res) => {
  const file = path.join(BUNDLE, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  try {
    res.setHeader('content-type', MIME[path.extname(file)] ?? 'application/octet-stream');
    res.end(readFileSync(file));
  } catch {
    res.statusCode = 404;
    res.end('not found');
  }
});
await new Promise((r) => server.listen(PORT, r));

const browser = await chromium.launch();
const results = [];
for (const rel of pages) {
  const page = await browser.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push(`jserror: ${e.message.split('\n')[0]}`));
  page.on('response', (r) => {
    if (r.status() === 404) problems.push(`404: ${new URL(r.url()).pathname}`);
  });
  try {
    await page.goto(`http://localhost:${PORT}/${rel}`, { waitUntil: 'networkidle', timeout: 15000 });
    const probe = await page.evaluate(() => {
      const cs = getComputedStyle(document.body);
      return {
        tokenVar: getComputedStyle(document.documentElement).getPropertyValue('--color-background-page').trim(),
        diagnostic: cs.backgroundImage.includes('repeating-linear-gradient'),
        bodyText: document.body.innerText.slice(0, 40),
      };
    });
    if (!probe.tokenVar) problems.push('tokens not loaded (--color-background-page unresolved)');
    if (probe.diagnostic) problems.push('magenta missing-situation diagnostic visible');
  } catch (e) {
    problems.push(`load failed: ${e.message.split('\n')[0]}`);
  }
  results.push({ page: rel, problems });
  await page.close();
}
await browser.close();
server.close();

let bad = 0;
for (const { page, problems } of results) {
  if (problems.length) {
    bad += 1;
    console.log(`FAIL ${page}`);
    for (const p of problems) console.log(`     - ${p}`);
  } else {
    console.log(`ok   ${page}`);
  }
}
console.log(`\n${results.length} pages, ${bad} with problems`);
process.exit(bad ? 1 : 0);
