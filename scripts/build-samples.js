// Emits the per-situation sample pages plus the situations index and the
// mixing demo. Every page declares data-situation and consumes base.css —
// no page carries its own reset or element defaults (ADR
// 2026-07-20-reading-situations §3: shedding the hand-rolled micro-resets
// is the validation of the base layer).
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const matrix = JSON.parse(readFileSync(path.join(ROOT, 'config/matrix.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const page = ({ title, situation, style, body, depth = '' }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="${depth}tokens.css">
<link rel="stylesheet" href="${depth}base.css">
<style>${style}</style>
</head>
<body data-situation="${situation}">
${body}
</body>
</html>
`;

const CHROME_STYLE = `
  .wrap { max-width: var(--container-max); margin-inline: auto; padding-inline: var(--container-gutter); }
  header.site { border-block-end: var(--border-width-default) solid var(--color-border-default);
                background: var(--color-background-surface); margin-block-end: var(--rhythm-section); }
  header.site .wrap { display: flex; align-items: center; gap: var(--space-md); padding-block: var(--space-sm); }
  .brand { font: var(--typography-heading-3); color: var(--color-text-heading); text-decoration: none;
           display: inline-flex; align-items: center; gap: var(--space-xs); }
  .brand img { display: inline-block; height: var(--space-lg); }
  .masthead { font: var(--typography-label); color: var(--color-text-muted); }
  footer.site { border-block-start: var(--border-width-default) solid var(--color-border-default);
                padding-block: var(--space-lg); margin-block-start: var(--rhythm-section); }
  footer.site .wrap { display: flex; justify-content: space-between; }
  footer.site p, footer.site a { font: var(--typography-caption); color: var(--color-text-muted); margin: 0; }
`;

// home=true links the brand to the dist index — system pages only; sample
// pages stay chrome-free (their brand is inert, as on a real product page).
const chromeHeader = (masthead, depth = '', home = false) => `<header class="site">
  <div class="wrap">
    <a class="brand" href="${home ? `${depth}index.html` : '#'}"><img src="${depth}sax-logo-symbol.svg" alt="">SAX Capital</a>
    <span class="masthead">${masthead}</span>
  </div>
</header>`;

const chromeFooter = `<footer class="site">
  <div class="wrap">
    <p>&copy; 2026 SAX Capital. All rights reserved.</p>
    <p><a href="#">Disclosures</a> &middot; <a href="#">Privacy</a></p>
  </div>
</footer>`;

// ---------------------------------------------------------------------------
// marketing — wide stage, visual impact (recast of the former home page).
// ---------------------------------------------------------------------------

const MARKETING_STYLE = `${CHROME_STYLE}
  /* Full-bleed sections manage their own wrap; unlayered rules win over sax-base. */
  main { max-width: none; padding-inline: 0; }

  .btn { font: var(--button-label-font); border-radius: var(--button-radius);
         padding: var(--button-padding-block) var(--button-padding-inline);
         cursor: pointer; text-decoration: none; display: inline-block; }
  .btn.primary { background: var(--button-primary-background); color: var(--button-primary-text); border: none; }
  .btn.primary:hover { background: var(--button-primary-background-hover); }
  .btn.primary:active { background: var(--button-primary-background-active); }
  .btn.secondary { background: var(--button-secondary-background); color: var(--button-secondary-text);
                   border: var(--border-width-default) solid var(--button-secondary-border); }

  header.site { margin-block-end: 0; }
  header.site .wrap { gap: var(--space-lg); }
  .links { display: flex; gap: var(--space-md); flex: 1; }
  .links a { font: var(--typography-label); color: var(--color-text-body); text-decoration: none; }
  .links a:hover { color: var(--color-accent-hover); }

  .hero { padding-block: var(--space-3xl); }
  .hero h1 { max-width: 36rem; }
  .hero p { color: var(--color-text-muted); max-width: 40rem; margin-block-end: var(--space-lg); }
  .hero .actions { display: flex; gap: var(--space-sm); }

  .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md);
              padding-block-end: var(--space-2xl); }
  .card { background: var(--card-background); border: var(--border-width-default) solid var(--card-border);
          border-radius: var(--card-radius); padding: var(--card-padding); }
  .card h3 { margin-block-end: var(--space-xs); }
  .card p { font: var(--typography-body-small); color: var(--color-text-muted); margin: 0; }

  .stats { background: var(--color-accent-subtle); padding-block: var(--space-xl); }
  .stats .wrap { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); }
  .stat { margin: 0; }
  .stat dt { font: var(--typography-caption); color: var(--color-text-muted); text-transform: uppercase; }
  .stat dd { font: var(--typography-heading-2); color: var(--color-text-heading); }

  .signup { padding-block: var(--space-2xl); max-width: 28rem; }
  .field { display: grid; gap: var(--space-2xs); margin-block-end: var(--space-md); }
  .field label { font: var(--input-label-font); color: var(--color-text-heading); }
  .notice { background: var(--color-status-success-background); color: var(--color-status-success-text);
            border: var(--border-width-default) solid var(--color-status-success-border);
            border-radius: var(--radius-md); padding: var(--space-sm) var(--space-md);
            font: var(--typography-body-small); margin-block-start: var(--space-md); }
  footer.site { margin-block-start: 0; }
`;

const marketing = page({
  title: 'SAX Capital',
  situation: 'marketing',
  depth: '../',
  style: MARKETING_STYLE,
  body: `<header class="site">
  <nav class="wrap">
    <span class="brand"><img src="../sax-logo-symbol.svg" alt="">SAX Capital</span>
    <span class="links">
      <a href="#">Strategies</a>
      <a href="#">Insights</a>
      <a href="#">About</a>
    </span>
    <a class="btn secondary" href="#">Sign in</a>
    <a class="btn primary" href="#">Open an account</a>
  </nav>
</header>

<main>
  <section class="hero wrap">
    <h1>Disciplined exposure, measured risk</h1>
    <p>SAX Capital pairs systematic strategies with rigorous risk controls.
       Transparent reporting, daily liquidity, and a research process you can audit.</p>
    <div class="actions">
      <a class="btn primary" href="#">Get started</a>
      <a class="btn secondary" href="#">Read our methodology</a>
    </div>
  </section>

  <section class="features wrap">
    <div class="card">
      <h3>Systematic strategies</h3>
      <p>Rules-based allocation across asset classes, rebalanced on signal rather than sentiment.</p>
    </div>
    <div class="card">
      <h3>Risk first</h3>
      <p>Position limits, drawdown budgets, and stress tests are constraints in the optimizer, not afterthoughts.</p>
    </div>
    <div class="card">
      <h3>Transparent reporting</h3>
      <p>Daily attribution and exposure reports. <a href="#">See a sample report</a>.</p>
    </div>
  </section>

  <section class="stats">
    <div class="wrap">
      <dl class="stat"><dt>Assets under management</dt><dd>$2.4B</dd></dl>
      <dl class="stat"><dt>Track record</dt><dd>12 years</dd></dl>
      <dl class="stat"><dt>Reporting cadence</dt><dd>Daily</dd></dl>
    </div>
  </section>

  <section class="signup wrap">
    <h2>Request access</h2>
    <form>
      <div class="field">
        <label for="name">Full name</label>
        <input id="name" type="text" placeholder="Jane Doe">
      </div>
      <div class="field">
        <label for="email">Work email</label>
        <input id="email" type="email" placeholder="jane@firm.com">
      </div>
      <button class="btn primary" type="button">Request access</button>
    </form>
    <div class="notice">Accredited investors only. We respond within one business day.</div>
  </section>
</main>

${chromeFooter}`,
});

// ---------------------------------------------------------------------------
// literary — book measure, linear reading, links de-emphasized until hover
// (link emphasis is shell CSS by ADR §4, demonstrated here).
// ---------------------------------------------------------------------------

const LITERARY_STYLE = `${CHROME_STYLE}
  main a { color: inherit; text-decoration: underline; text-decoration-color: var(--color-border-default); text-underline-offset: 0.15em; }
  main a:hover { color: var(--link-text); text-decoration-color: currentColor; }
  .essay-title { margin-block-end: var(--space-2xs); }
  .byline { font: var(--typography-body-small); color: var(--color-text-muted); margin-block-end: var(--rhythm-section); }
  .initial::first-letter { font: var(--typography-heading-1); float: inline-start; padding-inline-end: var(--space-2xs); }
`;

const literary = page({
  title: 'On Holding Nothing — SAX Capital',
  situation: 'literary',
  depth: '../',
  style: LITERARY_STYLE,
  body: `${chromeHeader('Essays', '../')}

<main>
  <article>
    <h1 class="essay-title">On Holding Nothing</h1>
    <p class="byline">M. Okafor &middot; June 2026 &middot; 14 minute read</p>
    <p class="initial">There is a moment, familiar to anyone who has managed money through a
       drawdown, when the strongest position available is no position at all. The moment is
       hard to see because everything in the industry is built to keep you invested: the fee
       clock, the benchmark, the quarterly letter that must say something. Cash does not
       write letters.</p>
    <p>The discipline of holding nothing is older than the industry that discourages it.
       Grain merchants in the Osaka rice markets understood that the warehouse, not the
       trade, was the position of last resort — and that a merchant who could not bear an
       empty ledger would eventually fill it with someone else's risk.</p>
    <blockquote>An empty ledger is a position. It has a return, a variance, and — unlike
       most positions — a known worst case.</blockquote>
    <p>None of this argues for permanent caution. It argues for symmetry. If a strategy can
       say <em>buy</em>, it must be able to say <em>nothing</em>, and the institution around it must
       be able to hear that answer without flinching. The <a href="#">methodology note</a>
       describes how we size that answer; the practice of accepting it is harder to write
       down.</p>
    <p>What remains, after the models and the committees, is a temperament: the willingness
       to be visibly idle while being invisibly right. Markets pay for that temperament
       precisely because it is rare, and it is rare because it looks — for months at a
       time — exactly like doing nothing.</p>
  </article>
</main>

${chromeFooter}`,
});

// ---------------------------------------------------------------------------
// documentation — skimmable reference: visible links, lists, table, code,
// callouts, airier rhythm (the situation's delta does the airing).
// ---------------------------------------------------------------------------

const DOCUMENTATION_STYLE = `${CHROME_STYLE}
  main a { text-decoration: underline; text-underline-offset: 0.15em; }
  .toc { background: var(--color-background-surface); border: var(--border-width-default) solid var(--color-border-default);
         border-radius: var(--radius-md); padding: var(--space-md) var(--space-lg); }
  .toc ul { margin: 0; }
  .callout { background: var(--color-status-warning-background); color: var(--color-status-warning-text);
             border: var(--border-width-default) solid var(--color-status-warning-border);
             border-radius: var(--radius-md); padding: var(--space-sm) var(--space-md);
             font: var(--typography-body-small); }
`;

const documentation = page({
  title: 'Backtest Harness — SAX Capital Docs',
  situation: 'documentation',
  depth: '../',
  style: DOCUMENTATION_STYLE,
  body: `${chromeHeader('Documentation', '../')}

<main>
  <h1>Backtest harness</h1>
  <p>The harness pins strategy code and data snapshots so every result can be regenerated
     byte-for-byte. This page covers the run command, snapshot resolution, and common
     failure modes. See also <a href="#">Strategy packaging</a> and <a href="#">Data vendors</a>.</p>

  <nav class="toc">
    <ul>
      <li><a href="#run">Running a backtest</a></li>
      <li><a href="#snapshots">Snapshot resolution</a></li>
      <li><a href="#failures">Common failures</a></li>
    </ul>
  </nav>

  <h2 id="run">Running a backtest</h2>
  <p>Every run names a strategy, a snapshot, and a seed:</p>
  <pre><code>sax backtest run --strategy momentum-v3 \\
  --snapshot 2026-05-15T00:00Z --seed 42</code></pre>
  <p>Results land in the content-addressed store; the run id printed on completion is the
     only thing a research note needs to cite.</p>

  <h2 id="snapshots">Snapshot resolution</h2>
  <p>The <code>--snapshot</code> flag resolves through three sources, first match wins:</p>
  <ul>
    <li>An exact content address (<code>sha256:…</code>)</li>
    <li>A vendor timestamp, resolved against the snapshot index</li>
    <li>The literal <code>latest</code>, which is refused in CI</li>
  </ul>
  <table>
    <thead>
      <tr><th>Form</th><th>Reproducible</th><th>Allowed in CI</th></tr>
    </thead>
    <tbody>
      <tr><td><code>sha256:…</code></td><td>yes</td><td>yes</td></tr>
      <tr><td>timestamp</td><td>yes</td><td>yes</td></tr>
      <tr><td><code>latest</code></td><td>no</td><td>no</td></tr>
    </tbody>
  </table>

  <h2 id="failures">Common failures</h2>
  <p class="callout">Vendor restatements change history. A timestamp that resolved
     yesterday can resolve differently after a restatement — always cite the content
     address in published results.</p>
  <p>Exit codes: <code>2</code> unresolved snapshot, <code>3</code> strategy hash mismatch,
     <code>4</code> seed drift. Anything else is a bug — <a href="#">file it</a>.</p>
</main>

${chromeFooter}`,
});

// ---------------------------------------------------------------------------
// application — tool chrome: toolbar, sidebar of annotation cards, document
// table, form controls including the disabled state.
// ---------------------------------------------------------------------------

const APPLICATION_STYLE = `${CHROME_STYLE}
  body { display: grid; grid-template-rows: auto 1fr; min-height: 100vh; }
  header.site { margin-block-end: 0; }
  header.site .wrap { max-width: none; }
  .toolbar { display: flex; gap: var(--space-sm); align-items: center; flex: 1; justify-content: end; }
  .app { display: grid; grid-template-columns: 18rem 1fr; min-height: 0; }
  main { max-width: none; margin: 0; padding: var(--space-lg); }

  .sidebar { background: var(--color-background-surface);
             border-inline-end: var(--border-width-default) solid var(--color-border-default);
             padding: var(--space-md); overflow-y: auto; }
  .sidebar h2 { font: var(--typography-label); color: var(--color-text-muted);
                text-transform: uppercase; margin-block-end: var(--space-sm); }
  .annotation-card { background: var(--card-background);
                     border: var(--border-width-default) solid var(--card-border);
                     border-inline-start: var(--border-width-thick) solid var(--annotation-highlight);
                     border-radius: var(--radius-md); padding: var(--space-sm);
                     margin-block-end: var(--space-sm); }
  .annotation-card.selected { border-inline-start-color: var(--annotation-selected); }
  .annotation-card p { font: var(--typography-body-small); margin: 0; }
  .annotation-card .meta { font: var(--typography-caption); color: var(--color-text-muted); }

  .btn { font: var(--button-label-font); border-radius: var(--button-radius);
         padding: var(--button-padding-block) var(--button-padding-inline); cursor: pointer; }
  .btn.primary { background: var(--button-primary-background); color: var(--button-primary-text); border: none; }
  .btn.primary:hover { background: var(--button-primary-background-hover); }

  .doc-table { width: 100%; }
  .doc-table td a { text-decoration: none; font: var(--typography-label); }
  .filters { display: flex; gap: var(--space-sm); align-items: end; margin-block-end: var(--space-md); }
  .filters .field { display: grid; gap: var(--space-2xs); }
  .filters label { font: var(--input-label-font); color: var(--color-text-heading); }
`;

const application = page({
  title: 'Document Workspace — SAX Capital',
  situation: 'application',
  depth: '../',
  style: APPLICATION_STYLE,
  body: `<header class="site">
  <div class="wrap">
    <span class="brand"><img src="../sax-logo-symbol.svg" alt="">Document Workspace</span>
    <span class="toolbar">
      <input type="search" placeholder="Search documents" aria-label="Search documents">
      <button class="btn primary" type="button">Upload</button>
      <button type="button" disabled>Export</button>
    </span>
  </div>
</header>

<div class="app">
  <aside class="sidebar">
    <h2>Annotations</h2>
    <div class="annotation-card selected">
      <p>"drawdown budgets are constraints, not circuit breakers"</p>
      <p class="meta">methodology.pdf &middot; p. 12</p>
    </div>
    <div class="annotation-card">
      <p>"content-addressed snapshots survive vendor restatements"</p>
      <p class="meta">harness-spec.pdf &middot; p. 3</p>
    </div>
    <div class="annotation-card">
      <p>"daily attribution is a diagnosis, not a story"</p>
      <p class="meta">reporting-q2.pdf &middot; p. 7</p>
    </div>
  </aside>

  <main>
    <h1>Recently uploaded</h1>
    <form class="filters">
      <div class="field">
        <label for="type">Type</label>
        <select id="type">
          <option>All</option>
          <option>Research</option>
          <option>Compliance</option>
        </select>
      </div>
      <div class="field">
        <label for="owner">Owner</label>
        <input id="owner" type="text" placeholder="Any owner">
      </div>
      <div class="field">
        <label for="archived">Archive tag</label>
        <input id="archived" type="text" value="read-only" disabled>
      </div>
    </form>
    <table class="doc-table">
      <thead>
        <tr><th>Document</th><th>Owner</th><th>Uploaded</th><th>Pages</th></tr>
      </thead>
      <tbody>
        <tr><td><a href="#">methodology.pdf</a></td><td>M. Okafor</td><td>Jul 18, 2026</td><td>44</td></tr>
        <tr><td><a href="#">harness-spec.pdf</a></td><td>J. Lindqvist</td><td>Jul 17, 2026</td><td>12</td></tr>
        <tr><td><a href="#">reporting-q2.pdf</a></td><td>M. Okafor</td><td>Jul 15, 2026</td><td>28</td></tr>
        <tr><td><a href="#">custody-brief.pdf</a></td><td>A. Whitfield</td><td>Jul 11, 2026</td><td>6</td></tr>
      </tbody>
    </table>
  </main>
</div>`,
});

// ---------------------------------------------------------------------------
// situations index + mixing demo (dist root).
// ---------------------------------------------------------------------------

const INDEX_STYLE = `${CHROME_STYLE}
  main a { text-decoration: underline; text-underline-offset: 0.15em; }
`;

const situationRows = matrix.situations
  .map(
    (s) => `      <tr>
        <td><code>${s}</code></td>
        <td><a href="samples/${s === 'presentation' ? '../presentation/presentation.html' : `${s}.html`}">sample</a></td>
        <td><a href="catalog/${s}.html">token catalog</a></td>
        <td><a href="patterns/${s}.html">patterns</a></td>
      </tr>`,
  )
  .join('\n');

const index = page({
  title: 'SAX design system',
  situation: 'documentation',
  style: INDEX_STYLE,
  body: `${chromeHeader('Design System', '', true)}

<main>
  <h1>SAX design system</h1>
  <p>One stylesheet serves five reading situations. Import <code>tokens.css</code> and
     <code>base.css</code>, declare <code>data-situation</code> on <code>&lt;body&gt;</code>
     (or <code>&lt;html&gt;</code>), and re-scope any region with its own attribute.
     A page that declares no situation renders deliberately broken. See the
     <a href="demos/mixing.html">mixing demo</a> for regions of several situations on one page.</p>
  <table>
    <thead><tr><th>Situation</th><th>Sample page</th><th>Token catalog</th><th>Patterns</th></tr></thead>
    <tbody>
${situationRows}
    </tbody>
  </table>
  <h2>Application prototypes</h2>
  <p>The <a href="prototypes/application/index.html">prototype fleet</a> — four
     archetypes assembled at build time from the page-shell pattern, for
     reviewing design changes across every page at once.</p>

  <h2>Guides</h2>
  <p>In the repository (markdown): <code>guidelines/building-pages.md</code>
     (composing pages), <code>guidelines/adding-components.md</code> (the ADR
     path), <code>guidelines/brand.md</code> (voice and visual restraint).</p>
</main>

${chromeFooter}`,
});

const MIXING_STYLE = `${CHROME_STYLE}
  main { padding-block-end: var(--space-2xl); }
  .region { border: var(--border-width-thick) dashed var(--color-border-strong);
            border-radius: var(--radius-lg); margin-block-end: var(--space-xl);
            padding: var(--space-xl) var(--space-lg); }
  .region-label { font: var(--typography-caption); color: var(--color-text-muted);
                  text-transform: uppercase; margin-block-end: var(--space-md); }
`;

const mixing = page({
  title: 'Mixing situations — SAX design system',
  situation: 'application',
  style: MIXING_STYLE,
  depth: '../',
  body: `${chromeHeader('Mixing demo', '../', true)}

<main>
  <h1>One page, four situations</h1>
  <p class="region-label">page chrome: application</p>

  <section class="region" data-situation="marketing">
    <p class="region-label">region: marketing</p>
    <h2>Disciplined exposure, measured risk</h2>
    <p>Wide stage, pure-white canvas in light mode, engagement over density.</p>
  </section>

  <article class="region" data-situation="literary">
    <p class="region-label">region: literary</p>
    <p>There is a moment, familiar to anyone who has managed money through a drawdown,
       when the strongest position available is no position at all. The tinted page and
       book measure belong to the literary situation even inside an application frame.</p>
  </article>

  <section class="region" data-situation="documentation">
    <p class="region-label">region: documentation</p>
    <p>Airier rhythm, visible links: see <a href="#">snapshot resolution</a> for how
       <code>--snapshot</code> forms are ranked.</p>
    <ul>
      <li>Exact content address</li>
      <li>Vendor timestamp</li>
      <li><code>latest</code> (refused in CI)</li>
    </ul>
  </section>
</main>

${chromeFooter}`,
});

// ---------------------------------------------------------------------------
// write everything
// ---------------------------------------------------------------------------

const samplesDir = path.join(ROOT, 'dist', 'samples');
mkdirSync(samplesDir, { recursive: true });
copyFileSync(
  path.join(ROOT, 'static-assets/logos/symbol-only/SAX_logo_symbol.svg'),
  path.join(ROOT, 'dist', 'sax-logo-symbol.svg'),
);
const outputs = [
  ['samples/marketing.html', marketing],
  ['samples/literary.html', literary],
  ['samples/documentation.html', documentation],
  ['samples/application.html', application],
  ['index.html', index],
  ['demos/mixing.html', mixing],
];
for (const [file, html] of outputs) {
  mkdirSync(path.dirname(path.join(ROOT, 'dist', file)), { recursive: true });
  writeFileSync(path.join(ROOT, 'dist', file), html);
  console.log(`dist/${file}`);
}
console.log(`(generated by ${pkg.name} v${pkg.version})`);
