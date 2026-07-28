// Shared navigation strip for the generated system pages (home, token
// catalogs, pattern sheets, demos, prototype gallery). Sample pages and
// individual prototypes stay chrome-free by decision — they are the
// artifact under review, and nav chrome would contaminate what they
// demonstrate.

export const NAV_CSS = `
  .site-nav { display: flex; align-items: center; gap: var(--space-md);
              font: var(--typography-label);
              background: var(--color-background-surface);
              border-block-end: var(--border-width-default) solid var(--color-border-default);
              padding: var(--space-xs) var(--container-gutter); }
  .site-nav a { text-decoration: none; }
  .site-nav .nav-home { color: var(--color-text-heading); }
  .site-nav .nav-here { color: var(--color-text-muted); }
  .site-nav .nav-links { display: flex; gap: var(--space-sm); flex: 1; justify-content: end; flex-wrap: wrap; }
  .site-nav .nav-links .current { color: var(--color-text-muted); }
`;

/**
 * @param {object} opts
 * @param {string} opts.depth  relative prefix to dist root ('' | '../' | '../../')
 * @param {string} opts.here   label for the current surface ("token catalog")
 * @param {Array<{label: string, href?: string, current?: boolean}>} [opts.links]
 */
export function navStrip({ depth, here, links = [] }) {
  const items = links
    .map(({ label, href, current }) =>
      current ? `<span class="current">${label}</span>` : `<a href="${href}">${label}</a>`,
    )
    .join('\n    ');
  return `<nav class="site-nav">
  <a class="nav-home" href="${depth}index.html">SAX design system</a>
  <span class="nav-here">${here}</span>
  <div class="nav-links">
    ${items}
  </div>
</nav>`;
}
