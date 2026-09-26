# ArcMoon example

A small two-page site that uses every ArcMoon feature.

```bash
cd example
npx arcm build pages     # → dist/index.html, dist/about.html
```

Open `dist/index.html` in a browser. Set `externalScripts` / `externalStyles` to `true` in `arcmoon.config.js` to get separate `.js` / `.css` files in `dist/assets/`.

| Feature | Where |
| --- | --- |
| `[import]`, `importAliases` (`@/…`) | `pages/index.arcm` |
| Layout with `[doctype!]`, `[slot]` fallback | `src/layouts/Layout.arcm` |
| Props, `ArcMoon.props()`, slot fallback | `src/components/Card.arcm` |
| `[for-each]` with `i`, JSON import | `pages/index.arcm` |
| `${ }$` with npm (`html-tag-names`) and `node:fs` | `pages/index.arcm`, `pages/about.arcm` |
| `ArcMoon.version` | `src/layouts/Layout.arcm` (footer) |
| `export` → runtime values | `src/components/Counter.arcm`, `pages/index.arcm` |
| Live text, class, `disabled`, events, `arcmoon/reactive` | `src/components/Counter.arcm` |
| Single ref (`arcm-ref`) | `src/layouts/Layout.arcm` (theme button) |
| Shared ref collected from many components | `src/components/Tag.arcm` + `pages/index.arcm` |
| npm in runtime code (`bundle`), local JS import | `pages/index.arcm` (`svg-tag-names`, `src/scripts/pick.js`) |
| `[script = src]` file | `src/layouts/Layout.arcm` (`src/scripts/visit.js`) |
| Scoped component styles, `:global()` | every file in `src/components/`, `src/layouts/Layout.arcm` |
| `--name` props: fixed, compile time, live | `pages/about.arcm`, `src/components/Card.arcm`, `src/components/Counter.arcm` |
| Page `[style]` with `${ }$` values | `pages/about.arcm` |
| `[link]` stylesheet, `@import`, `url()` files | `src/layouts/Layout.arcm`, `src/styles/main.css` |
| `arcm-raw`, `arcm-syntax`, escapes, comments, `{ raw }` | `pages/about.arcm` |
