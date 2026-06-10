import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const matrix = JSON.parse(readFileSync(path.join(ROOT, 'config/matrix.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const PRODUCT = 'blog-page';
if (!matrix.products.includes(PRODUCT)) {
  throw new Error(`Product "${PRODUCT}" is not in config/matrix.json`);
}

const STYLE = `
  * { box-sizing: border-box; margin: 0; }
  body { background: var(--color-background-page); color: var(--color-text-body);
         font: var(--typography-body); }
  a { color: var(--link-text); }
  a:hover { color: var(--link-text-hover); }
  .wrap { max-width: 44rem; margin-inline: auto; padding-inline: var(--space-lg); }

  header.site { border-block-end: var(--border-width-default) solid var(--color-border-default);
                background: var(--color-background-surface); margin-block-end: var(--space-2xl); }
  header.site .wrap { display: flex; align-items: baseline; gap: var(--space-md);
                      padding-block: var(--space-sm); }
  .brand { font: var(--typography-heading-3); color: var(--color-text-heading);
           text-decoration: none; }
  .masthead { font: var(--typography-label); color: var(--color-text-muted); }

  .page-title { font: var(--typography-heading-1); color: var(--color-text-heading);
                margin-block-end: var(--space-xs); }
  .page-sub { color: var(--color-text-muted); margin-block-end: var(--space-2xl); }

  article { background: var(--card-background);
            border: var(--border-width-default) solid var(--card-border);
            border-radius: var(--card-radius); padding: var(--card-padding);
            margin-block-end: var(--space-xl); }
  article h2 { font: var(--typography-heading-2); margin-block-end: var(--space-2xs); }
  article h2 a { color: var(--color-text-heading); text-decoration: none; }
  article h2 a:hover { color: var(--color-accent-hover); }
  .meta { font: var(--typography-caption); color: var(--color-text-muted);
          margin-block-end: var(--space-md); }
  article p { margin-block-end: var(--space-md); }
  article p:last-child { margin-block-end: 0; }

  .tags { display: flex; gap: var(--space-2xs); margin-block-end: var(--space-md); }
  .tag { font: var(--typography-caption); color: var(--color-text-link);
         background: var(--color-accent-subtle); border-radius: var(--radius-full);
         padding: var(--space-2xs) var(--space-sm); }

  blockquote { border-inline-start: var(--border-width-thick) solid var(--color-accent-default);
               padding-inline-start: var(--space-md); margin-block-end: var(--space-md);
               color: var(--color-text-muted); }
  pre { background: var(--color-background-inset); border-radius: var(--radius-md);
        border: var(--border-width-default) solid var(--color-border-default);
        padding: var(--space-md); overflow-x: auto; margin-block-end: var(--space-md); }
  code { font: var(--typography-code); }
  p > code { background: var(--color-background-inset); border-radius: var(--radius-sm);
             padding-inline: var(--space-2xs); }

  .post-footer { border-block-start: var(--border-width-default) solid var(--color-border-default);
                 padding-block-start: var(--space-sm); font: var(--typography-body-small);
                 color: var(--color-text-muted); }

  nav.pager { display: flex; justify-content: space-between; margin-block-end: var(--space-2xl); }
  nav.pager a { font: var(--typography-label); }

  footer.site { border-block-start: var(--border-width-default) solid var(--color-border-default);
                padding-block: var(--space-lg); }
  footer.site .wrap { display: flex; justify-content: space-between; }
  footer.site p, footer.site a { font: var(--typography-caption); color: var(--color-text-muted); }
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Research Notes — SAX Capital</title>
<link rel="stylesheet" href="tokens.css">
<style>${STYLE}</style>
</head>
<body>
<header class="site">
  <div class="wrap">
    <a class="brand" href="#">SAX Capital</a>
    <span class="masthead">Research Notes</span>
  </div>
</header>

<main class="wrap">
  <h1 class="page-title">Research Notes</h1>
  <p class="page-sub">Short writeups from the research desk: methodology, tooling, and market structure.</p>

  <article>
    <h2><a href="#">Drawdown budgets as optimizer constraints</a></h2>
    <p class="meta">June 3, 2026 &middot; M. Okafor &middot; 6 min read</p>
    <div class="tags"><span class="tag">risk</span><span class="tag">methodology</span></div>
    <p>Most risk frameworks treat drawdown limits as a circuit breaker: breach the limit,
       cut exposure. We prefer to express the budget inside the optimizer itself, so the
       portfolio never wants to take positions it would be forced to unwind.</p>
    <blockquote>A constraint you enforce after the fact is a constraint your optimizer
       was allowed to ignore.</blockquote>
    <p>The practical effect is fewer forced sales in stressed markets, at the cost of a
       modest reduction in expected return during calm regimes. We think that trade is
       underpriced.</p>
    <p class="post-footer">Filed under risk &middot; <a href="#">Discuss</a></p>
  </article>

  <article>
    <h2><a href="#">Reproducible backtests with pinned data snapshots</a></h2>
    <p class="meta">May 19, 2026 &middot; J. Lindqvist &middot; 4 min read</p>
    <div class="tags"><span class="tag">tooling</span></div>
    <p>A backtest that cannot be re-run byte-for-byte is an anecdote. Our harness pins
       both the strategy code and the data snapshot it ran against, so every result in a
       research note can be regenerated with one command:</p>
    <pre><code>sax backtest run --strategy momentum-v3 \\
  --snapshot 2026-05-15T00:00Z --seed 42</code></pre>
    <p>The <code>--snapshot</code> flag resolves to a content-addressed dataset, which is
       what makes the guarantee hold even after vendors restate history.</p>
    <p class="post-footer">Filed under tooling &middot; <a href="#">Discuss</a></p>
  </article>

  <article>
    <h2><a href="#">What daily attribution actually buys you</a></h2>
    <p class="meta">May 5, 2026 &middot; M. Okafor &middot; 5 min read</p>
    <div class="tags"><span class="tag">reporting</span><span class="tag">methodology</span></div>
    <p>Monthly attribution tells you what happened. Daily attribution tells you when it
       happened, which is the difference between a story and a diagnosis. Most of the
       value shows up in the first week of a regime change.</p>
    <p>We publish attribution to clients on the same cadence we consume it internally.
       If a report is not good enough to trade on, it is not good enough to send.</p>
    <p class="post-footer">Filed under reporting &middot; <a href="#">Discuss</a></p>
  </article>

  <nav class="pager">
    <a href="#">&larr; Newer notes</a>
    <a href="#">Older notes &rarr;</a>
  </nav>
</main>

<footer class="site">
  <div class="wrap">
    <p>&copy; 2026 SAX Capital. All rights reserved.</p>
    <p><a href="#">Disclosures</a> &middot; <a href="#">RSS</a></p>
  </div>
</footer>
</body>
</html>
`;

const outDir = path.join(ROOT, 'dist', PRODUCT);
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, 'blog.html'), html);
console.log(`dist/${PRODUCT}/blog.html (generated by ${pkg.name} v${pkg.version})`);
