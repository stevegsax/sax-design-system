// scripts/build-design-sync.js
//
// Builds the upload bundle for the claude.ai design-system project ("the
// mirror") from repo artifacts. The mirror is generated, never hand-edited
// (decisions/2026-07-24 repatriation): tokens come verbatim from
// dist/tokens.css, pattern cards wrap patterns/*.html, React components and
// their cards are emitted from the tables below, specimen cards from token
// data, UI kits from dist/samples/. Sync the output with the DesignSync
// tool (/design-sync flow), incrementally.
//
// Usage: node scripts/build-design-sync.js <out-dir>

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = process.argv[2];
if (!OUT) {
  console.error('usage: node scripts/build-design-sync.js <out-dir>');
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const stamp = `${pkg.name} v${pkg.version}`;
const GLOBAL = 'SAXCapitalDesignSystem_d2f345';

// React runtime for component cards — pinned UMD builds with SRI hashes,
// matching what the Design System pane already loads.
const REACT_SCRIPTS = `<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>`;

// ---------------------------------------------------------------------------
// Pure core
// ---------------------------------------------------------------------------

export function primitivesCss(primitiveColor, header) {
  const lines = [header, ':root {'];
  for (const [ramp, node] of Object.entries(primitiveColor)) {
    if (ramp.startsWith('$') || typeof node !== 'object') continue;
    lines.push(`  /* ${ramp} */`);
    for (const [step, token] of Object.entries(node)) {
      if (step.startsWith('$')) continue;
      lines.push(`  --color-${ramp}-${step}: ${token.$value.hex};`);
    }
  }
  lines.push('}');
  return `${lines.join('\n')}\n`;
}

export function patternHeader(html) {
  const comment = html.match(/<!--([\s\S]*?)-->/)?.[1] ?? '';
  const fields = {};
  for (const line of comment.split('\n')) {
    const m = line.match(/^\s*([a-z-]+):\s*(.+)$/);
    if (m) fields[m[1]] = m[2].trim();
  }
  return fields;
}

/** Custom properties declared in the base :root block of tokens.css. */
export function rootVars(tokensCssText) {
  const uncommented = tokensCssText.replace(/\/\*[\s\S]*?\*\//g, '');
  const block = uncommented.match(/:root\s*\{([^}]*)\}/)?.[1] ?? '';
  return [...block.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map(([, name, value]) => ({
    name,
    value: value.trim(),
  }));
}

/** Ordered step entries for one primitive ramp. */
export function rampSteps(primitiveColor, ramp) {
  return Object.entries(primitiveColor[ramp])
    .filter(([step]) => !step.startsWith('$'))
    .map(([step, token]) => ({ step, hex: token.$value.hex }));
}

// A specimen/slide card shell: plain HTML, tokens via ../styles.css.
export function card({ group, viewport, name, subtitle, css, body, depth = 1 }) {
  const prefix = '../'.repeat(depth);
  return `<!-- @dsCard group="${group}" viewport="${viewport}" name="${name}" subtitle="${subtitle}" -->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="${prefix}styles.css">
<style>
  body { margin: 0; padding: var(--space-lg); background: var(--color-background-page);
         font: var(--typography-body); color: var(--color-text-body); }
${css}</style>
</head>
<body>
${body}
</body>
</html>
`;
}

// A component card: React + babel, with the component source inlined so the
// card renders correctly even before the pane recompiles _ds_bundle.js.
export function inlineSource(jsx) {
  return jsx.replace(/^import React from 'react';\n+/, '').replaceAll('export function', 'function');
}

export function componentCard({ viewport, name, subtitle, css, sources, demo }) {
  return `<!-- @dsCard group="Components" viewport="${viewport}" name="${name}" subtitle="${subtitle}" -->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../../styles.css">
${REACT_SCRIPTS}
<style>
  body { margin: 0; padding: var(--space-lg); background: var(--color-background-page);
         font: var(--typography-body); color: var(--color-text-body); }
${css}</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
${sources.map(inlineSource).join('\n')}
${demo}
</script>
</body>
</html>
`;
}

export function patternCard({ name, html, baseCss, situation, viewport, subtitle }) {
  const title = name[0].toUpperCase() + name.slice(1);
  return `<!-- @dsCard group="Patterns" viewport="${viewport}" name="${title}" subtitle="${subtitle}" -->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../styles.css">
<style>
${baseCss}</style>
<style>
  body { margin: 0; padding: var(--space-lg); }
</style>
</head>
<body data-situation="${situation}">
${html}</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Component sources (React mirror of the pattern library)
// ---------------------------------------------------------------------------

const BUTTON_JSX = `import React from 'react';

/**
 * SAX Capital button. Primary (accent fill) and secondary (outline)
 * variants, styled from the --button-* component tokens. Disabled uses the
 * disabled color roles (never opacity).
 */
export function Button({
  variant = 'primary',
  type = 'button',
  disabled = false,
  href,
  children,
  style,
  ...rest
}) {
  const base = {
    font: 'var(--button-label-font)',
    borderRadius: 'var(--button-radius)',
    padding: 'var(--button-padding-block) var(--button-padding-inline)',
    cursor: disabled ? 'default' : 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    lineHeight: 1,
    transition: 'background 120ms ease, color 120ms ease',
    ...(disabled
      ? {
          background: 'var(--button-disabled-background)',
          color: 'var(--button-disabled-text)',
          border:
            variant === 'secondary'
              ? 'var(--border-width-default) solid var(--input-disabled-border)'
              : 'none',
        }
      : variant === 'primary'
        ? {
            background: 'var(--button-primary-background)',
            color: 'var(--button-primary-text)',
            border: 'none',
          }
        : {
            background: 'var(--button-secondary-background)',
            color: 'var(--button-secondary-text)',
            border: 'var(--border-width-default) solid var(--button-secondary-border)',
          }),
    ...style,
  };
  const swap = (bg) => (e) => {
    if (disabled || variant !== 'primary') return;
    e.currentTarget.style.background = bg;
  };
  const props = {
    style: base,
    onMouseEnter: swap('var(--button-primary-background-hover)'),
    onMouseLeave: swap('var(--button-primary-background)'),
    onMouseDown: swap('var(--button-primary-background-active)'),
    onMouseUp: swap('var(--button-primary-background-hover)'),
    ...rest,
  };
  if (href && !disabled) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
`;

const BUTTON_DTS = `import * as React from 'react';

/** SAX Capital button — primary (accent fill) or secondary (outline). */
export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual style. @default "primary" */
  variant?: 'primary' | 'secondary';
  /** Button type when rendered as <button>. @default "button" */
  type?: 'button' | 'submit' | 'reset';
  /** Disable interaction; renders the disabled color roles. */
  disabled?: boolean;
  /** Render as an <a> to this href instead of a <button>. */
  href?: string;
  children?: React.ReactNode;
}

export function Button(props: ButtonProps): JSX.Element;
`;

const BUTTON_PROMPT = `Primary call-to-action button; use \`variant="secondary"\` for lower-emphasis actions beside it. One primary per view.

\`\`\`jsx
<Button onClick={submit}>Request access</Button>
<Button variant="secondary" href="#method">Read our methodology</Button>
\`\`\`

- \`variant\`: \`"primary"\` (accent fill, hover/active states) | \`"secondary"\` (surface + strong border, accent text; no hover tokens exist by design).
- \`href\` renders an \`<a>\`; otherwise a \`<button>\` (set \`type="submit"\` in forms).
- \`disabled\` renders the disabled color roles (\`--button-disabled-*\`) — never opacity.
- Copy follows guidelines/brand.md: sentence case, no exclamation marks.
`;

const LINK_JSX = `import React from 'react';

/** Inline text link, styled from the --link-* component tokens. */
export function Link({ href = '#', children, style, ...rest }) {
  const base = { color: 'var(--link-text)', ...style };
  return (
    <a
      href={href}
      style={base}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--link-text-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--link-text)')}
      {...rest}
    >
      {children}
    </a>
  );
}
`;

const LINK_DTS = `import * as React from 'react';

/** Inline text link. */
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
}

export function Link(props: LinkProps): JSX.Element;
`;

const LINK_PROMPT = `Inline text link for prose and navigation.

\`\`\`jsx
<Link href="/methodology">Read our methodology</Link>
\`\`\`

In plain HTML pages this component is unnecessary: base.css styles \`<a>\`
directly (the design system deliberately has no link pattern).
`;

const INPUT_JSX = `import React from 'react';

/**
 * Labelled form field: label above control, styled from the --input-*
 * component tokens (the "field" pattern).
 */
export function Input({ label, id, disabled = false, style, inputStyle, ...rest }) {
  const control = {
    font: 'var(--input-value-font)',
    padding: 'var(--input-padding-block) var(--input-padding-inline)',
    borderRadius: 'var(--input-radius)',
    ...(disabled
      ? {
          background: 'var(--input-disabled-background)',
          color: 'var(--input-disabled-text)',
          border: 'var(--input-border-width) solid var(--input-disabled-border)',
        }
      : {
          background: 'var(--input-background)',
          color: 'var(--input-text)',
          border: 'var(--input-border-width) solid var(--input-border)',
        }),
    outline: 'none',
    ...inputStyle,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xs)', ...style }}>
      {label && (
        <label htmlFor={id} style={{ font: 'var(--input-label-font)' }}>
          {label}
        </label>
      )}
      <input
        id={id}
        disabled={disabled}
        style={control}
        onFocus={(e) => {
          e.currentTarget.style.outline =
            'var(--input-border-width-focus) solid var(--input-border-focus)';
          e.currentTarget.style.outlineOffset = '1px';
        }}
        onBlur={(e) => (e.currentTarget.style.outline = 'none')}
        {...rest}
      />
    </div>
  );
}
`;

const INPUT_DTS = `import * as React from 'react';

/** Labelled form field (label above control). */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visible label; rendered with --input-label-font. */
  label?: string;
  /** id linking label and control. */
  id?: string;
  /** Extra styles for the wrapper. */
  style?: React.CSSProperties;
  /** Extra styles for the <input> itself. */
  inputStyle?: React.CSSProperties;
}

export function Input(props: InputProps): JSX.Element;
`;

const INPUT_PROMPT = `Labelled text field — one control per field block.

\`\`\`jsx
<Input label="Work email" id="email" type="email" autoComplete="email" />
\`\`\`

- Focus shows the accent outline (\`--input-border-focus\`); disabled uses the disabled color roles.
- Placeholder styling needs a stylesheet rule (\`::placeholder\`); in full pages base.css provides it.
`;

const CARD_JSX = `import React from 'react';

/** Bordered surface container. Cards are flat — border, never a shadow. */
export function Card({ children, style, ...rest }) {
  return (
    <div
      style={{
        background: 'var(--card-background)',
        border: 'var(--border-width-default) solid var(--card-border)',
        borderRadius: 'var(--card-radius)',
        padding: 'var(--card-padding)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
`;

const CARD_DTS = `import * as React from 'react';

/** Bordered surface container (flat; border, never a shadow). */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Card(props: CardProps): JSX.Element;
`;

const CARD_PROMPT = `Bordered surface container for any flow content.

\`\`\`jsx
<Card>
  <h3>Risk controls</h3>
  <p>Position limits are enforced inside the optimizer.</p>
</Card>
\`\`\`

Cards are flat by standard: border on surface, never a shadow. Situations
may remap \`--card-border\`.
`;

const TAG_JSX = `import React from 'react';

/** Topic/metadata pill, styled from the --tag-* component tokens. */
export function Tag({ children, style, ...rest }) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: 'var(--tag-background)',
        color: 'var(--tag-text)',
        font: 'var(--tag-label-font)',
        borderRadius: 'var(--tag-radius)',
        padding: 'var(--tag-padding-block) var(--tag-padding-inline)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
`;

const TAG_DTS = `import * as React from 'react';

/** Topic/metadata pill. */
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

export function Tag(props: TagProps): JSX.Element;
`;

const TAG_PROMPT = `Topic or metadata pill, inline with text or in a meta row.

\`\`\`jsx
<Tag>risk</Tag> <Tag>attribution</Tag>
\`\`\`

Not interactive by itself; wrap in a link when it filters or navigates.
Backed by the \`tag.*\` component tokens (APCA-gated pairing).
`;

const ALERT_JSX = `import React from 'react';

const TONES = {
  success: 'status',
  warning: 'status',
  danger: 'alert',
};

/**
 * System-generated transient status notice. Authored admonitions in
 * documentation are the Callout component instead.
 */
export function Alert({ tone = 'success', children, style, ...rest }) {
  return (
    <div
      role={TONES[tone] ?? 'status'}
      style={{
        background: 'var(--color-status-' + tone + '-background)',
        color: 'var(--color-status-' + tone + '-text)',
        border:
          'var(--border-width-default) solid var(--color-status-' + tone + '-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-sm) var(--space-md)',
        font: 'var(--typography-body-small)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
`;

const ALERT_DTS = `import * as React from 'react';

/** System-generated transient status notice. */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Status tone. @default "success" */
  tone?: 'success' | 'warning' | 'danger';
  children?: React.ReactNode;
}

export function Alert(props: AlertProps): JSX.Element;
`;

const ALERT_PROMPT = `Transient status notice generated by the system on a live page.

\`\`\`jsx
<Alert tone="success">Report generated. A copy is in your documents queue.</Alert>
<Alert tone="danger">The backtest could not be reproduced. See the run log.</Alert>
\`\`\`

- \`tone\`: \`success\` | \`warning\` | \`danger\` — the semantic status roles, all APCA-gated.
- Danger renders \`role="alert"\`; success/warning render \`role="status"\`.
- For authored, standing admonitions in documentation use Callout, not Alert.
`;

const CALLOUT_JSX = `import React from 'react';

const VARIANTS = ['note', 'tip', 'important', 'warning', 'caution'];

/**
 * Authored admonition for static documentation: bounded rectangle, uniform
 * inset fill, per-variant border and title ink (--callout-* tokens).
 * Renders an <aside>.
 */
export function Callout({ variant = 'note', title, children, style, ...rest }) {
  const v = VARIANTS.includes(variant) ? variant : 'note';
  return (
    <aside
      style={{
        background: 'var(--callout-background)',
        border:
          'var(--callout-border-width) solid var(--callout-' + v + '-border)',
        borderRadius: 'var(--callout-radius)',
        padding: 'var(--callout-padding-block) var(--callout-padding-inline)',
        font: 'var(--callout-body-font)',
        ...style,
      }}
      {...rest}
    >
      <p
        style={{
          font: 'var(--callout-title-font)',
          color: 'var(--callout-' + v + '-title)',
          margin: '0 0 var(--space-2xs)',
        }}
      >
        {title ?? v[0].toUpperCase() + v.slice(1)}
      </p>
      <div style={{ margin: 0 }}>{children}</div>
    </aside>
  );
}
`;

const CALLOUT_DTS = `import * as React from 'react';

/** Authored admonition for static documentation (renders an <aside>). */
export interface CalloutProps extends React.HTMLAttributes<HTMLElement> {
  /** GitHub admonition vocabulary. @default "note" */
  variant?: 'note' | 'tip' | 'important' | 'warning' | 'caution';
  /** Title line; defaults to the capitalized variant. */
  title?: string;
  children?: React.ReactNode;
}

export function Callout(props: CalloutProps): JSX.Element;
`;

const CALLOUT_PROMPT = `Authored, standing admonition in static documentation — the five GitHub
admonition types. Distinct from Alert (system-generated transient status).

\`\`\`jsx
<Callout variant="warning">A strategy hash mismatch invalidates every downstream table.</Callout>
<Callout variant="tip" title="Tip">Pin the data snapshot in the run manifest.</Callout>
\`\`\`

- \`variant\`: \`note\` | \`tip\` | \`important\` | \`warning\` | \`caution\`. There is no info/aside/summary — info and aside fold into note (ADR 2026-07-24-callout-pattern).
- Uniform inset fill; only border and title ink vary. In markdown-rendered pages the same classes apply to blockquote-based admonitions.
`;

const COMPONENTS = [
  { dir: 'components/actions', name: 'Button', jsx: BUTTON_JSX, dts: BUTTON_DTS, prompt: BUTTON_PROMPT },
  { dir: 'components/actions', name: 'Link', jsx: LINK_JSX, dts: LINK_DTS, prompt: LINK_PROMPT },
  { dir: 'components/forms', name: 'Input', jsx: INPUT_JSX, dts: INPUT_DTS, prompt: INPUT_PROMPT },
  { dir: 'components/content', name: 'Card', jsx: CARD_JSX, dts: CARD_DTS, prompt: CARD_PROMPT },
  { dir: 'components/content', name: 'Tag', jsx: TAG_JSX, dts: TAG_DTS, prompt: TAG_PROMPT },
  { dir: 'components/content', name: 'Alert', jsx: ALERT_JSX, dts: ALERT_DTS, prompt: ALERT_PROMPT },
  { dir: 'components/content', name: 'Callout', jsx: CALLOUT_JSX, dts: CALLOUT_DTS, prompt: CALLOUT_PROMPT },
];

// ---------------------------------------------------------------------------
// Imperative shell
// ---------------------------------------------------------------------------

const write = (rel, content) => {
  const dest = path.join(OUT, rel);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, content);
  console.log(rel);
};

const tokensCssText = readFileSync(path.join(ROOT, 'dist/tokens.css'), 'utf8');
const baseCss = readFileSync(path.join(ROOT, 'dist/base.css'), 'utf8');
const primitiveColor = JSON.parse(
  readFileSync(path.join(ROOT, 'tokens/primitive/color.tokens.json'), 'utf8'),
).color;
const vars = rootVars(tokensCssText);

// --- Tokens -----------------------------------------------------------------

write('tokens/tokens.css', tokensCssText);
write(
  'tokens/primitives.css',
  primitivesCss(
    primitiveColor,
    `/* Primitive tonal ramps — specimen cards only, generated from ${stamp}.\n   Primitives never appear in product code; reach for semantic or component\n   tokens (see readme). */`,
  ),
);
write(
  'styles.css',
  `/* SAX Capital Design System — global entry point. Generated from ${stamp};\n   do not edit here, edit the repo (github.com/stevegsax/sax-design-system).\n   tokens.css is the shipped stylesheet verbatim (base :root + per-situation\n   delta blocks); primitives.css exists only for ramp specimen cards. */\n@import "tokens/primitives.css";\n@import "tokens/tokens.css";\n`,
);
write('base.css', baseCss);

// Brand marks: the script owns the mirror's copies (SVG + PNG from the repo).
for (const rel of readdirSync(path.join(ROOT, 'static-assets/logos'), { recursive: true })) {
  const src = path.join(ROOT, 'static-assets/logos', rel);
  if (!/\.(svg|png)$/.test(rel)) continue;
  write(path.join('static-assets/logos', rel), readFileSync(src));
}

// --- Pattern cards ------------------------------------------------------------

const CARD_LAYOUT = {
  button: { situation: 'application', viewport: '720x140' },
  field: { situation: 'application', viewport: '720x300' },
  card: { situation: 'application', viewport: '720x260' },
  alert: { situation: 'application', viewport: '720x300' },
  tag: { situation: 'application', viewport: '720x120' },
  callout: { situation: 'documentation', viewport: '720x840' },
};

for (const file of readdirSync(path.join(ROOT, 'patterns')).filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(path.join(ROOT, 'patterns', file), 'utf8');
  const name = path.basename(file, '.html');
  const layout = CARD_LAYOUT[name] ?? { situation: 'application', viewport: '720x400' };
  const subtitle = (patternHeader(html).usage ?? '').split('. ')[0];
  write(`patterns/${name}.card.html`, patternCard({ name, html, baseCss, subtitle, ...layout }));
}

// --- React components + cards -------------------------------------------------

for (const c of COMPONENTS) {
  write(`${c.dir}/${c.name}.jsx`, c.jsx);
  write(`${c.dir}/${c.name}.d.ts`, c.dts);
  write(`${c.dir}/${c.name}.prompt.md`, c.prompt);
}

write(
  'components/actions/buttons.card.html',
  componentCard({
    viewport: '720x150',
    name: 'Buttons & Links',
    subtitle: 'Primary / secondary / disabled buttons and inline links',
    css: '  .row { display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap; }\n',
    sources: [BUTTON_JSX, LINK_JSX],
    demo: `function Demo() {
  return (
    <div className="row">
      <Button>Request access</Button>
      <Button variant="secondary">Read our methodology</Button>
      <Button disabled>Open an account</Button>
      <Link href="#">See a sample report</Link>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<Demo />);`,
  }),
);

write(
  'components/forms/input.card.html',
  componentCard({
    viewport: '720x180',
    name: 'Input',
    subtitle: 'Labelled field with focus and disabled states',
    css: '  .row { display: flex; gap: var(--space-lg); align-items: end; flex-wrap: wrap; }\n',
    sources: [INPUT_JSX],
    demo: `function Demo() {
  return (
    <div className="row">
      <Input label="Work email" id="email" type="email" />
      <Input label="Reference" id="ref" disabled defaultValue="RN-2026-041" />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<Demo />);`,
  }),
);

write(
  'components/content/content.card.html',
  componentCard({
    viewport: '720x420',
    name: 'Card, Tag & Alert',
    subtitle: 'Surface container, metadata pills, status notices',
    css: '  .col { display: flex; flex-direction: column; gap: var(--space-md); max-width: 40rem; }\n  h3 { font: var(--typography-heading-3); color: var(--color-text-heading); margin: 0 0 var(--space-xs); }\n  p { margin: 0; }\n',
    sources: [CARD_JSX, TAG_JSX, ALERT_JSX],
    demo: `function Demo() {
  return (
    <div className="col">
      <Card>
        <h3>Risk controls</h3>
        <p>Position limits and drawdown budgets are enforced inside the optimizer.</p>
        <div style={{ display: 'flex', gap: 'var(--space-2xs)', marginTop: 'var(--space-sm)' }}>
          <Tag>risk</Tag><Tag>attribution</Tag>
        </div>
      </Card>
      <Alert tone="success">Report generated. A copy is in your documents queue.</Alert>
      <Alert tone="warning">Market data is delayed by 15 minutes.</Alert>
      <Alert tone="danger">The backtest could not be reproduced. See the run log.</Alert>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<Demo />);`,
  }),
);

write(
  'components/content/callouts.card.html',
  componentCard({
    viewport: '720x700',
    name: 'Callouts',
    subtitle: 'Authored admonitions — note / tip / important / warning / caution',
    css: '  .col { display: flex; flex-direction: column; gap: var(--space-md); max-width: 44rem; }\n  p { margin: 0; }\n',
    sources: [CALLOUT_JSX],
    demo: `function Demo() {
  return (
    <div className="col">
      <Callout variant="note"><p>Vendor restatements change history; cite the content address in published results.</p></Callout>
      <Callout variant="tip"><p>Pin the data snapshot in the run manifest to make reruns byte-for-byte identical.</p></Callout>
      <Callout variant="important"><p>Timestamps resolve against the content address, not the vendor feed.</p></Callout>
      <Callout variant="warning"><p>A strategy hash mismatch invalidates every downstream attribution table.</p></Callout>
      <Callout variant="caution"><p>Deleting a snapshot is irreversible and breaks reproduction of any run that cites it.</p></Callout>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<Demo />);`,
  }),
);

// --- Guideline specimen cards ---------------------------------------------------

const rampCard = (ramp, name, subtitle) => {
  const steps = rampSteps(primitiveColor, ramp);
  const cells = steps
    .map(
      ({ step }) =>
        `  <div class="step"><div class="sw${step === 'anchor' ? ' anchor' : ''}" style="background:var(--color-${ramp}-${step})"></div><div class="lbl">${step}</div></div>`,
    )
    .join('\n');
  return card({
    group: 'Colors',
    viewport: '700x150',
    name,
    subtitle,
    css: `  .ramp { display: grid; grid-template-columns: repeat(${steps.length}, 1fr); gap: 2px; font: var(--typography-caption); color: var(--color-text-muted); }
  .step { display: flex; flex-direction: column; }
  .sw { height: 3rem; border-radius: var(--radius-sm); }
  .lbl { margin-top: var(--space-2xs); text-align: center; }
  .anchor { outline: var(--border-width-thick) solid var(--color-text-heading); outline-offset: 2px; }
`,
    body: `<div class="ramp">\n${cells}\n</div>`,
  });
};

write('guidelines/color-brand.card.html', rampCard('brand', 'Brand ramp', 'OKLCH tonal ramp anchored to SAX logo blue #005A9C'));
write('guidelines/color-neutral.card.html', rampCard('neutral', 'Neutral ramp', 'Near-achromatic with a faint cool tint'));

const statusRows = ['success', 'warning', 'danger']
  .map((ramp) => {
    const cells = rampSteps(primitiveColor, ramp)
      .map(({ step }) => `<div class="sw" style="background:var(--color-${ramp}-${step})" title="${ramp}.${step}"></div>`)
      .join('');
    return `  <div class="row"><span class="name">${ramp}</span><div class="cells">${cells}</div></div>`;
  })
  .join('\n');
write(
  'guidelines/color-status.card.html',
  card({
    group: 'Colors',
    viewport: '700x220',
    name: 'Status ramps',
    subtitle: 'Success (hue 150), warning (85), danger (25)',
    css: `  .row { display: flex; align-items: center; gap: var(--space-md); margin-block-end: var(--space-sm); }
  .name { width: 5rem; font: var(--typography-label); color: var(--color-text-muted); }
  .cells { display: flex; gap: 2px; flex: 1; }
  .sw { height: 2.5rem; flex: 1; border-radius: var(--radius-sm); }
`,
    body: statusRows,
  }),
);

const semanticSwatches = vars
  .filter(({ name }) => name.startsWith('--color-'))
  .map(
    ({ name }) =>
      `  <div class="item"><div class="sw" style="background:var(${name})"></div><code>${name}</code></div>`,
  )
  .join('\n');
write(
  'guidelines/color-semantic.card.html',
  card({
    group: 'Colors',
    viewport: '700x640',
    name: 'Semantic roles',
    subtitle: 'Every --color-* role, light-dark() aware',
    css: `  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-sm); }
  .sw { height: 2.25rem; border-radius: var(--radius-sm); border: var(--border-width-default) solid var(--color-border-default); }
  code { font: var(--typography-caption); color: var(--color-text-muted); overflow-wrap: anywhere; }
`,
    body: `<div class="grid">\n${semanticSwatches}\n</div>`,
  }),
);

const spaceBars = vars
  .filter(({ name }) => name.startsWith('--space-'))
  .map(
    ({ name, value }) =>
      `  <div class="row"><code>${name}</code><div class="bar" style="width:var(${name})"></div><span>${value}</span></div>`,
  )
  .join('\n');
write(
  'guidelines/spacing-scale.card.html',
  card({
    group: 'Spacing',
    viewport: '700x330',
    name: 'Spacing scale',
    subtitle: 'Fixed 4px-based scale; rhythm roles vary per situation',
    css: `  .row { display: flex; align-items: center; gap: var(--space-md); margin-block-end: var(--space-xs); font: var(--typography-caption); color: var(--color-text-muted); }
  .row code { width: 8rem; }
  .bar { height: 12px; background: var(--color-accent-default); border-radius: 2px; }
`,
    body: spaceBars,
  }),
);

const radiusBoxes = vars
  .filter(({ name }) => name.startsWith('--radius-'))
  .map(
    ({ name }) =>
      `  <div class="item"><div class="box" style="border-radius:var(${name})"></div><code>${name}</code></div>`,
  )
  .join('\n');
const borderRows = vars
  .filter(({ name }) => name.startsWith('--border-width-'))
  .map(
    ({ name, value }) =>
      `  <div class="brow"><code>${name}</code><div class="line" style="border-top:var(${name}) solid var(--color-border-strong)"></div><span>${value}</span></div>`,
  )
  .join('\n');
write(
  'guidelines/spacing-radius.card.html',
  card({
    group: 'Spacing',
    viewport: '700x300',
    name: 'Radii & borders',
    subtitle: 'Corner radii and device-pixel-aligned strokes',
    css: `  .items { display: flex; gap: var(--space-lg); margin-block-end: var(--space-lg); }
  .item { display: flex; flex-direction: column; gap: var(--space-2xs); align-items: center; font: var(--typography-caption); color: var(--color-text-muted); }
  .box { width: 64px; height: 64px; background: var(--color-accent-subtle); border: var(--border-width-default) solid var(--color-border-strong); }
  .brow { display: flex; align-items: center; gap: var(--space-md); margin-block-end: var(--space-xs); font: var(--typography-caption); color: var(--color-text-muted); }
  .brow code { width: 12rem; }
  .line { flex: 1; }
`,
    body: `<div class="items">\n${radiusBoxes}\n</div>\n${borderRows}`,
  }),
);

const typeCard = (file, name, subtitle, rows, viewport = '700x300') =>
  write(
    file,
    card({
      group: 'Type',
      viewport,
      name,
      subtitle,
      css: `  .sample { margin-block-end: var(--space-md); }
  .sample code { display: block; font: var(--typography-caption); color: var(--color-text-muted); margin-block-start: var(--space-2xs); }
`,
      body: rows
        .map(
          ([v, text]) =>
            `<div class="sample"><div style="font:var(${v})${v === '--typography-heading-1' || v === '--typography-heading-2' || v === '--typography-heading-3' ? ';color:var(--color-text-heading)' : ''}">${text}</div><code>${v}</code></div>`,
        )
        .join('\n'),
    }),
  );

typeCard(
  'guidelines/type-headings.card.html',
  'Headings',
  'Composite font roles, sentence case by standard',
  [
    ['--typography-heading-1', 'Disciplined exposure, measured risk'],
    ['--typography-heading-2', 'Risk controls inside the optimizer'],
    ['--typography-heading-3', 'Reproducible by construction'],
  ],
  '700x340',
);
typeCard(
  'guidelines/type-body.card.html',
  'Body & labels',
  'Body, small, label, caption roles',
  [
    ['--typography-body', 'We prefer to express the drawdown budget inside the optimizer, so the portfolio never wants positions it would be forced to unwind.'],
    ['--typography-body-small', 'At the cost of a modest reduction in expected return during calm regimes.'],
    ['--typography-label', 'Request access'],
    ['--typography-caption', 'June 3, 2026 · M. Okafor · 6 min read'],
  ],
  '700x360',
);
typeCard(
  'guidelines/type-code.card.html',
  'Code',
  'Monospace role for CLI names and snippets',
  [['--typography-code', 'sax backtest run --strategy drawdown-budget-v2 --seed 42']],
  '700x160',
);

write(
  'guidelines/brand-logos.card.html',
  card({
    group: 'Brand',
    viewport: '700x260',
    name: 'Logos',
    subtitle: 'Full lockup, wordmark, symbol — the only brand imagery',
    css: `  .row { display: flex; align-items: center; gap: var(--space-2xl); }
  .item { display: flex; flex-direction: column; gap: var(--space-xs); align-items: center; font: var(--typography-caption); color: var(--color-text-muted); }
  img { height: 72px; }
`,
    body: `<div class="row">
  <div class="item"><img src="../static-assets/logos/full/SAX_logo_full.svg" alt="SAX Capital full lockup"><span>full</span></div>
  <div class="item"><img src="../static-assets/logos/wordmark-only/SAX_logo_wordmark.svg" alt="SAX Capital wordmark"><span>wordmark</span></div>
  <div class="item"><img src="../static-assets/logos/symbol-only/SAX_logo_symbol.svg" alt="SAX Capital symbol"><span>symbol</span></div>
</div>`,
  }),
);

// --- Slides ---------------------------------------------------------------------

const slide = (name, subtitle, css, body) =>
  card({
    group: 'Slides',
    viewport: '1280x720',
    name,
    subtitle,
    css: `  html, body { margin: 0; padding: 0; }
  .slide { width: 1280px; height: 720px; background: var(--color-background-page); color: var(--color-text-body);
           display: flex; flex-direction: column; justify-content: center; padding: 0 var(--space-3xl); box-sizing: border-box; }
  .tag { display: inline-block; background: var(--tag-background); color: var(--tag-text); font: var(--tag-label-font);
         border-radius: var(--tag-radius); padding: var(--tag-padding-block) var(--tag-padding-inline); }
${css}`,
    body,
  });

write(
  'slides/title.card.html',
  slide(
    'Title slide',
    'Cover — logo, title, tagline, topic tags',
    `  .slide img { height: 128px; margin-bottom: var(--space-lg); align-self: flex-start; }
  h1 { font: var(--typography-heading-1); font-size: 4.25rem; line-height: 1.1; color: var(--color-text-heading); margin: 0 0 var(--space-md); max-width: 60%; text-wrap: balance; }
  .tagline { font: var(--typography-heading-3); font-weight: 400; color: var(--color-text-muted); margin: 0 0 var(--space-xl); }
  .tags { display: flex; gap: var(--space-sm); }
`,
    `<div class="slide">
  <img src="../static-assets/logos/symbol-only/SAX_logo_symbol.svg" alt="SAX Capital">
  <h1>Disciplined exposure, measured risk</h1>
  <p class="tagline">Systematic strategies. Rigorous risk controls. Reporting you can audit.</p>
  <div class="tags"><span class="tag">2026 outlook</span><span class="tag">Investor briefing</span></div>
</div>`,
  ),
);

write(
  'slides/agenda.card.html',
  slide(
    'Agenda slide',
    'Numbered agenda over a rule',
    `  h2 { font: var(--typography-heading-2); font-size: 3rem; color: var(--color-text-heading); margin: 0 0 var(--space-xl); }
  ol { margin: 0; padding: 0; list-style: none; counter-reset: agenda; max-width: 70%; }
  li { counter-increment: agenda; font: var(--typography-heading-3); font-weight: 400; padding: var(--space-md) 0;
       border-top: var(--border-width-default) solid var(--color-border-default); display: flex; gap: var(--space-lg); }
  li::before { content: counter(agenda, decimal-leading-zero); font: var(--typography-label); color: var(--color-text-link); }
`,
    `<div class="slide">
  <h2>Agenda</h2>
  <ol>
    <li>Portfolio positioning and drawdown budgets</li>
    <li>Attribution — what worked, what did not</li>
    <li>Research pipeline and reproducibility</li>
    <li>Outlook and constraints for 2026</li>
  </ol>
</div>`,
  ),
);

write(
  'slides/metrics.card.html',
  slide(
    'Metrics slide',
    'Stat band — uppercase eyebrows over figures',
    `  h2 { font: var(--typography-heading-2); font-size: 3rem; color: var(--color-text-heading); margin: 0 0 var(--space-2xl); }
  .band { display: flex; gap: var(--space-3xl); background: var(--color-accent-subtle); border-radius: var(--radius-lg); padding: var(--space-2xl); }
  .stat { display: flex; flex-direction: column; gap: var(--space-xs); }
  .eyebrow { font: var(--typography-label); letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-muted); }
  .figure { font: var(--typography-heading-1); font-size: 3.5rem; color: var(--color-text-heading); }
`,
    `<div class="slide">
  <h2>By the numbers</h2>
  <div class="band">
    <div class="stat"><span class="eyebrow">Assets under management</span><span class="figure">$2.4B</span></div>
    <div class="stat"><span class="eyebrow">Max drawdown budget</span><span class="figure">8%</span></div>
    <div class="stat"><span class="eyebrow">Backtests reproducible</span><span class="figure">100%</span></div>
  </div>
</div>`,
  ),
);

write(
  'slides/quote.card.html',
  slide(
    'Quote slide',
    'Aphorism with accent bar attribution',
    `  blockquote { border-inline-start: var(--border-width-thick) solid var(--color-accent-default);
                padding-inline-start: var(--space-xl); margin: 0; max-width: 75%; }
  blockquote p { font: var(--typography-heading-2); font-size: 3.25rem; line-height: 1.2; color: var(--color-text-heading); margin: 0 0 var(--space-lg); text-wrap: balance; }
  cite { font: var(--typography-label); color: var(--color-text-muted); font-style: normal; }
`,
    `<div class="slide">
  <blockquote>
    <p>A backtest that cannot be re-run byte-for-byte is an anecdote.</p>
    <cite>SAX research standards</cite>
  </blockquote>
</div>`,
  ),
);

// --- Templates (claude.ai Design Components) -------------------------------------

const DS_BASE_JS = `// Loads this design system into the template. In a consuming project, point
// base at the bound DS folder relative to this file (e.g. '_ds/<folder>' at
// the project root, '../_ds/<folder>' one level down) — one line to edit.
(() => {
  const base = '../..';
  for (const p of ["styles.css"]) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = base + '/' + p;
    document.head.appendChild(l);
  }
  const s = document.createElement('script');
  s.src = base + '/_ds_bundle.js';
  s.onerror = () => console.error('ds-base.js: failed to load ' + s.src + ' — if this is a consuming project, point the base line in ds-base.js at the bound _ds/<folder> tree relative to this page (e.g. _ds/<folder> at the project root, ../_ds/<folder> one level down); in a fresh design system this can just mean the bundle is not compiled yet');
  document.head.appendChild(s);
})();
`;

const dcPage = ({ name, description, body }) => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<!-- @template name="${name}" description="${description}" -->
<helmet>
<script src="./ds-base.js"></script>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; }
  a { color: var(--link-text); }
  a:hover { color: var(--link-text-hover); }
</style>
</helmet>
${body}
</x-dc>
</body>
</html>
`;

write('templates/research-note/ds-base.js', DS_BASE_JS);
write('templates/marketing-page/ds-base.js', DS_BASE_JS);

write(
  'templates/research-note/ResearchNote.dc.html',
  dcPage({
    name: 'Research Note',
    description:
      'SAX Capital research blog post — masthead, title, byline, topic tags, and article body with blockquote and code, from design-system tokens.',
    body: `<div style="background: var(--color-background-page); color: var(--color-text-body); font: var(--typography-body); min-height: 100vh;">

  <header style="border-block-end: var(--border-width-default) solid var(--color-border-default); background: var(--color-background-surface);">
    <div style="max-width: 44rem; margin-inline: auto; padding: var(--space-sm) var(--space-lg); display: flex; align-items: center; gap: var(--space-md);">
      <a href="#" style="display: inline-flex; align-items: center; gap: var(--space-xs); text-decoration: none;">
        <img src="../../static-assets/logos/symbol-only/SAX_logo_symbol.svg" alt="" style="height: var(--space-lg);">
        <span style="font: var(--typography-heading-3); color: var(--color-text-heading);">SAX Capital</span>
      </a>
      <span style="font: var(--typography-label); color: var(--color-text-muted);">Research Notes</span>
    </div>
  </header>

  <main style="max-width: 44rem; margin-inline: auto; padding: var(--space-2xl) var(--space-lg);">
    <a href="#" style="font: var(--typography-label); text-decoration: none; display: inline-block; margin-block-end: var(--space-lg);">← All notes</a>

    <h1 style="font: var(--typography-heading-1); color: var(--color-text-heading); margin: 0 0 var(--space-2xs); text-wrap: balance;">Drawdown budgets as optimizer constraints</h1>
    <p style="font: var(--typography-caption); color: var(--color-text-muted); margin: 0 0 var(--space-md);">June 3, 2026 · M. Okafor · 6 min read</p>

    <div style="display: flex; gap: var(--space-2xs); margin-block-end: var(--space-lg);">
      <x-import component-from-global-scope="${GLOBAL}.Tag" hint-size="60px,24px">risk</x-import>
      <x-import component-from-global-scope="${GLOBAL}.Tag" hint-size="100px,24px">methodology</x-import>
    </div>

    <p style="margin: 0 0 var(--space-md);">Most risk frameworks treat drawdown limits as a circuit breaker: breach the limit, cut exposure. We prefer to express the budget inside the optimizer itself, so the portfolio never wants to take positions it would be forced to unwind.</p>

    <blockquote style="border-inline-start: var(--border-width-thick) solid var(--color-accent-default); padding-inline-start: var(--space-md); margin: 0 0 var(--space-md); color: var(--color-text-muted);">A constraint you enforce after the fact is a constraint your optimizer was allowed to ignore.</blockquote>

    <p style="margin: 0 0 var(--space-md);">The practical effect is fewer forced sales in stressed markets, at the cost of a modest reduction in expected return during calm regimes. Reproduce the result with:</p>

    <pre style="background: var(--color-background-inset); border: var(--border-width-default) solid var(--color-border-default); border-radius: var(--radius-md); padding: var(--space-md); overflow-x: auto; margin: 0 0 var(--space-md);"><code style="font: var(--typography-code);">sax backtest run --strategy drawdown-budget-v2 \\
  --snapshot 2026-05-15T00:00Z --seed 42</code></pre>

    <p style="margin: 0 0 var(--space-lg);">We think that trade is underpriced.</p>

    <p style="border-block-start: var(--border-width-default) solid var(--color-border-default); padding-block-start: var(--space-sm); font: var(--typography-body-small); color: var(--color-text-muted); margin: 0;">Filed under risk · <a href="#">Discuss</a></p>
  </main>

  <footer style="border-block-start: var(--border-width-default) solid var(--color-border-default); padding-block: var(--space-lg); margin-block-start: var(--space-2xl);">
    <div style="max-width: 44rem; margin-inline: auto; padding-inline: var(--space-lg); display: flex; justify-content: space-between; font: var(--typography-caption); color: var(--color-text-muted);">
      <span>© 2026 SAX Capital. All rights reserved.</span>
      <span><a href="#">Disclosures</a> · <a href="#">RSS</a></span>
    </div>
  </footer>
</div>`,
  }),
);

write(
  'templates/marketing-page/MarketingPage.dc.html',
  dcPage({
    name: 'Marketing Page',
    description:
      'SAX Capital marketing home — masthead, hero, feature cards, stat band, access form, and footer, from design-system tokens.',
    body: `<div style="background: var(--color-background-page); color: var(--color-text-body); font: var(--typography-body); min-height: 100vh;">

  <header style="border-block-end: var(--border-width-default) solid var(--color-border-default); background: var(--color-background-surface);">
    <div style="max-width: 70rem; margin-inline: auto; padding: var(--space-sm) var(--space-lg); display: flex; align-items: center; gap: var(--space-lg);">
      <span style="display: inline-flex; align-items: center; gap: var(--space-xs);">
        <img src="../../static-assets/logos/symbol-only/SAX_logo_symbol.svg" alt="" style="height: var(--space-lg);">
        <span style="font: var(--typography-heading-3); color: var(--color-text-heading);">SAX Capital</span>
      </span>
      <nav style="display: flex; gap: var(--space-md); flex: 1; font: var(--typography-label);">
        <a href="#" style="text-decoration: none; color: var(--color-text-body);">Strategies</a>
        <a href="#" style="text-decoration: none; color: var(--color-text-body);">Research</a>
        <a href="#" style="text-decoration: none; color: var(--color-text-body);">About</a>
      </nav>
      <x-import component-from-global-scope="${GLOBAL}.Button" hint-size="150px,36px">Request access</x-import>
    </div>
  </header>

  <main style="max-width: 70rem; margin-inline: auto; padding: var(--space-3xl) var(--space-lg);">
    <h1 style="font: var(--typography-heading-1); color: var(--color-text-heading); margin: 0 0 var(--space-md); max-width: 60%; text-wrap: balance;">Disciplined exposure, measured risk</h1>
    <p style="font: var(--typography-heading-3); font-weight: 400; color: var(--color-text-muted); margin: 0 0 var(--space-2xl); max-width: 55%;">Systematic strategies. Rigorous risk controls. Reporting you can audit.</p>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-lg); margin-block-end: var(--space-2xl);">
      <div style="background: var(--card-background); border: var(--border-width-default) solid var(--card-border); border-radius: var(--card-radius); padding: var(--card-padding);">
        <h3 style="font: var(--typography-heading-3); color: var(--color-text-heading); margin: 0 0 var(--space-xs);">Rules-based strategies</h3>
        <p style="margin: 0;">Every position traces to a constraint the optimizer was given, not a judgment call it was allowed to make.</p>
      </div>
      <div style="background: var(--card-background); border: var(--border-width-default) solid var(--card-border); border-radius: var(--card-radius); padding: var(--card-padding);">
        <h3 style="font: var(--typography-heading-3); color: var(--color-text-heading); margin: 0 0 var(--space-xs);">Drawdown budgets</h3>
        <p style="margin: 0;">Risk limits live inside the optimizer, so stressed markets trigger fewer forced sales.</p>
      </div>
      <div style="background: var(--card-background); border: var(--border-width-default) solid var(--card-border); border-radius: var(--card-radius); padding: var(--card-padding);">
        <h3 style="font: var(--typography-heading-3); color: var(--color-text-heading); margin: 0 0 var(--space-xs);">Auditable research</h3>
        <p style="margin: 0;">Backtests re-run byte-for-byte from pinned snapshots; anything less is an anecdote.</p>
      </div>
    </div>

    <div style="display: flex; gap: var(--space-3xl); background: var(--color-accent-subtle); border-radius: var(--radius-lg); padding: var(--space-xl); margin-block-end: var(--space-2xl);">
      <div><div style="font: var(--typography-label); letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-muted);">Assets under management</div><div style="font: var(--typography-heading-2); color: var(--color-text-heading);">$2.4B</div></div>
      <div><div style="font: var(--typography-label); letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-muted);">Max drawdown budget</div><div style="font: var(--typography-heading-2); color: var(--color-text-heading);">8%</div></div>
      <div><div style="font: var(--typography-label); letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-muted);">Backtests reproducible</div><div style="font: var(--typography-heading-2); color: var(--color-text-heading);">100%</div></div>
    </div>

    <div style="max-width: 32rem;">
      <h2 style="font: var(--typography-heading-2); color: var(--color-text-heading); margin: 0 0 var(--space-md);">Request access</h2>
      <div style="display: flex; gap: var(--space-sm); align-items: end;">
        <x-import component-from-global-scope="${GLOBAL}.Input" hint-size="280px,64px">Work email</x-import>
        <x-import component-from-global-scope="${GLOBAL}.Button" hint-size="150px,36px">Request access</x-import>
      </div>
      <p style="font: var(--typography-body-small); color: var(--color-text-muted); margin: var(--space-sm) 0 0;">Accredited investors only. We respond within one business day.</p>
    </div>
  </main>

  <footer style="border-block-start: var(--border-width-default) solid var(--color-border-default); padding-block: var(--space-lg); margin-block-start: var(--space-2xl);">
    <div style="max-width: 70rem; margin-inline: auto; padding-inline: var(--space-lg); display: flex; justify-content: space-between; font: var(--typography-caption); color: var(--color-text-muted);">
      <span>© 2026 SAX Capital. All rights reserved.</span>
      <span><a href="#">Disclosures</a> · <a href="#">Privacy</a></span>
    </div>
  </footer>
</div>`,
  }),
);

// --- UI kits (shipped sample pages, links rebased to mirror paths) -----------------

const rebaseSample = (file) =>
  readFileSync(path.join(ROOT, 'dist/samples', file), 'utf8')
    .replaceAll('href="../tokens.css"', 'href="../../styles.css"')
    .replaceAll('href="../base.css"', 'href="../../base.css"')
    .replaceAll('../sax-logo-symbol.svg', '../../static-assets/logos/symbol-only/SAX_logo_symbol.svg');

write('ui_kits/marketing/index.html', rebaseSample('marketing.html'));
write(
  'ui_kits/marketing/README.md',
  `# Marketing UI kit\n\nThe shipped \`dist/samples/marketing.html\` from ${stamp}, verbatim (logo\npath rebased). Regenerated by \`scripts/build-design-sync.js\`; do not edit.\n`,
);
write('ui_kits/research-notes/index.html', rebaseSample('literary.html'));
write(
  'ui_kits/research-notes/README.md',
  `# Research notes UI kit\n\nThe shipped \`dist/samples/literary.html\` (the research-blog reading\nsituation) from ${stamp}, verbatim (logo path rebased). Regenerated by\n\`scripts/build-design-sync.js\`; do not edit.\n`,
);

// --- Docs -------------------------------------------------------------------------

for (const doc of readdirSync(path.join(ROOT, 'guidelines')).filter((f) => f.endsWith('.md'))) {
  write(`guidelines/${doc}`, readFileSync(path.join(ROOT, 'guidelines', doc), 'utf8'));
}
write('SKILL.md', readFileSync(path.join(ROOT, '.claude/skills/sax-designer/SKILL.md'), 'utf8'));

write(
  'readme.md',
  `# SAX Capital Design System

Generated mirror of [\`${pkg.name}\`](https://github.com/stevegsax/sax-design-system)
v${pkg.version} for design and prototyping on claude.ai. The repository is the
source of truth: every change lands there as an ADR, ships as a release,
and is re-synced here by \`scripts/build-design-sync.js\`. Do not edit this
project directly — every file except the app-managed ones
(\`_ds_bundle.js\`, \`_ds_manifest.json\`, \`support.js\`, thumbnails) is
overwritten on the next sync.

## Contents

- \`styles.css\` — entry point; imports the shipped \`tokens/tokens.css\`
  (base \`:root\` plus one \`[data-situation]\` delta block per reading
  situation) and specimen-only \`tokens/primitives.css\`. \`base.css\` is the
  shipped element-styling layer, used by the UI kits and pattern cards.
- \`patterns/\` — cards for the shipped pattern library (button, field,
  card, alert, tag, callout), rendered with the shipped \`base.css\`
  element styling under a declared situation.
- \`components/\` — React components mirroring the pattern library
  (Button, Link, Input, Card, Tag, Alert, Callout), generated with
  current token truths: disabled states use the disabled color roles,
  callouts speak the five GitHub admonition types.
- \`guidelines/\` — ratified brand standards (\`brand.md\`), the how-to
  guides (\`building-pages.md\`, \`adding-components.md\`), and specimen
  cards generated from the token source.
- \`slides/\` — presentation-situation sample slides.
- \`templates/\` — Design Component starting points (marketing page,
  research note).
- \`ui_kits/\` — the shipped sample pages, verbatim.
- \`SKILL.md\` — the \`sax-designer\` skill as shipped in the package.
- \`static-assets/logos/\` — the only brand imagery (see
  \`guidelines/brand.md\`).

## Reading situations

Pages declare \`data-situation\` — \`literary\`, \`documentation\`,
\`marketing\`, \`presentation\`, or \`application\` — and the delta blocks in
\`tokens/tokens.css\` retune the situation contract (content measure,
rhythm, leading, callout density). No declaration renders deliberately
broken (magenta diagnostic) when \`base.css\` is present.
`,
);

console.log(`\nbundle written to ${OUT} (from ${stamp})`);
