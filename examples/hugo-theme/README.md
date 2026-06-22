# SAX Capital Hugo theme

A distribution example: a [Hugo](https://gohugo.io/) theme styled entirely from
`@sax/design-tokens`. It shows how a downstream static site consumes the published
`tokens.css` — no Sass, no build step, no token toolchain. Every rule in
`static/css/theme.css` references a token custom property; there are no raw color,
spacing, or type values.

This is consumer example code, not a generated token artifact, so it lives under
`examples/` rather than `dist/`.

## What it renders

- **Home** (`layouts/index.html`) — SAX Capital marketing page: hero, feature cards,
  stats band, request-access form. Driven by front matter in `content/_index.md`.
- **Blog index** (`layouts/_default/list.html`) — reverse-chronological list of posts
  with date, author, reading time, and tags.
- **Post** (`layouts/_default/single.html`) — single article: prose, blockquote, code,
  tag chips, back link.

Light and dark are automatic: `tokens.css` emits `light-dark()` values under
`color-scheme: light dark`, so the site follows the OS setting with no toggle.

## Layout

```
hugo-theme/
├── theme.toml
├── archetypes/default.md
├── layouts/
│   ├── index.html              Home
│   ├── _default/baseof.html    Page shell
│   ├── _default/list.html      Blog index
│   ├── _default/single.html    Post
│   └── partials/{head,header,footer}.html
├── static/
│   ├── css/tokens.css          Vendored from @sax/design-tokens (see below)
│   ├── css/theme.css           Component styles, token custom properties only
│   └── img/sax-logo-symbol.svg
└── exampleSite/                Runnable demo site
    ├── hugo.toml
    └── content/{_index.md, blog/_index.md, blog/*.md}
```

## Run the example site

From this directory:

```sh
cd exampleSite
hugo server --themesDir ../..
```

`--themesDir ../..` points Hugo at `examples/`, where it resolves the theme named
`hugo-theme` (the `theme = "hugo-theme"` line in `exampleSite/hugo.toml`). Open
<http://localhost:1313/>. To produce static output, run `hugo --themesDir ../..`;
it writes to `exampleSite/public/`.

## Using the tokens in your own site

The theme links two stylesheets, tokens first:

```html
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/theme.css">
```

`static/css/tokens.css` here is a committed copy of
`@sax/design-tokens/dist/blog-page/tokens.css` — the blog product build, whose
stronger card borders and dimmer page suit a content-heavy site. To retune for a
different surface, replace it with another product's build (for example
`dist/product-home-page/tokens.css` for an airier marketing canvas); `theme.css`
does not change. In a real consumer that installs the package as a git dependency,
copy or symlink the file from `node_modules/@sax/design-tokens/dist/<product>/tokens.css`
during deploy rather than vendoring it by hand.
