import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const matrix = JSON.parse(readFileSync(path.join(ROOT, 'config/matrix.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const PRODUCT = 'product-home-page';
if (!matrix.products.includes(PRODUCT)) {
  throw new Error(`Product "${PRODUCT}" is not in config/matrix.json`);
}

const STYLE = `
  * { box-sizing: border-box; margin: 0; }
  body { background: var(--color-background-page); color: var(--color-text-body);
         font: var(--typography-body); }
  a { color: var(--link-text); }
  a:hover { color: var(--link-text-hover); }
  .wrap { max-width: 70rem; margin-inline: auto; padding-inline: var(--space-lg); }

  .btn { font: var(--button-label-font); border-radius: var(--button-radius);
         padding: var(--button-padding-block) var(--button-padding-inline);
         cursor: pointer; text-decoration: none; display: inline-block; }
  .btn.primary { background: var(--button-primary-background); color: var(--button-primary-text); border: none; }
  .btn.primary:hover { background: var(--button-primary-background-hover); }
  .btn.primary:active { background: var(--button-primary-background-active); }
  .btn.secondary { background: var(--button-secondary-background); color: var(--button-secondary-text);
                   border: var(--border-width-default) solid var(--button-secondary-border); }

  header { border-block-end: var(--border-width-default) solid var(--color-border-default);
           background: var(--color-background-surface); }
  nav { display: flex; align-items: center; gap: var(--space-lg);
        padding-block: var(--space-sm); }
  .brand { font: var(--typography-heading-3); color: var(--color-text-heading); }
  nav .links { display: flex; gap: var(--space-md); flex: 1; }
  nav .links a { font: var(--typography-label); color: var(--color-text-body); text-decoration: none; }
  nav .links a:hover { color: var(--color-accent-hover); }

  .hero { padding-block: var(--space-3xl); }
  .hero h1 { font: var(--typography-heading-1); color: var(--color-text-heading);
             max-width: 36rem; margin-block-end: var(--space-md); }
  .hero p { font: var(--typography-body); color: var(--color-text-muted);
            max-width: 40rem; margin-block-end: var(--space-lg); }
  .hero .actions { display: flex; gap: var(--space-sm); }

  .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md);
              padding-block-end: var(--space-2xl); }
  .card { background: var(--card-background); border: var(--border-width-default) solid var(--card-border);
          border-radius: var(--card-radius); padding: var(--card-padding); }
  .card h3 { font: var(--typography-heading-3); color: var(--color-text-heading);
             margin-block-end: var(--space-xs); }
  .card p { font: var(--typography-body-small); color: var(--color-text-muted); }

  .stats { background: var(--color-accent-subtle); padding-block: var(--space-xl); }
  .stats .wrap { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); }
  .stat dt { font: var(--typography-caption); color: var(--color-text-muted);
             text-transform: uppercase; }
  .stat dd { font: var(--typography-heading-2); color: var(--color-text-heading); }

  .signup { padding-block: var(--space-2xl); max-width: 28rem; }
  .signup h2 { font: var(--typography-heading-2); color: var(--color-text-heading);
               margin-block-end: var(--space-md); }
  .field { display: grid; gap: var(--space-2xs); margin-block-end: var(--space-md); }
  .field label { font: var(--input-label-font); color: var(--color-text-heading); }
  .field input { font: var(--input-value-font); color: var(--input-text);
                 background: var(--input-background); border-radius: var(--input-radius);
                 border: var(--input-border-width) solid var(--input-border);
                 padding: var(--input-padding-block) var(--input-padding-inline); }
  .field input::placeholder { color: var(--input-placeholder); }
  .field input:focus { outline: none;
                       border: var(--input-border-width-focus) solid var(--input-border-focus); }
  .notice { background: var(--color-status-success-background); color: var(--color-status-success-text);
            border: var(--border-width-default) solid var(--color-status-success-border);
            border-radius: var(--radius-md); padding: var(--space-sm) var(--space-md);
            font: var(--typography-body-small); margin-block-start: var(--space-md); }

  footer { border-block-start: var(--border-width-default) solid var(--color-border-default);
           padding-block: var(--space-lg); }
  footer .wrap { display: flex; justify-content: space-between; }
  footer p, footer a { font: var(--typography-caption); color: var(--color-text-muted); }
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SAX Capital</title>
<link rel="stylesheet" href="tokens.css">
<style>${STYLE}</style>
</head>
<body>
<header>
  <nav class="wrap">
    <span class="brand">SAX Capital</span>
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

<footer>
  <div class="wrap">
    <p>&copy; 2026 SAX Capital. All rights reserved.</p>
    <p><a href="#">Disclosures</a> &middot; <a href="#">Privacy</a></p>
  </div>
</footer>
</body>
</html>
`;

const outDir = path.join(ROOT, 'dist', PRODUCT);
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, 'home.html'), html);
console.log(`dist/${PRODUCT}/home.html (generated by ${pkg.name} v${pkg.version})`);
