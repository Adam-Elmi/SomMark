# ArcMoon examples

A showcase site: every ArcMoon feature on its own page, with a light and a dark theme.

```bash
cd example
npx arcm build pages     # → dist/*.html
```

Open `dist/index.html`. Set `externalScripts` / `externalStyles` to `true` in `arcmoon.config.js` to get separate `.js` / `.css` files in `dist/assets/`.

| Page | Shows |
| --- | --- |
| `components` | `[import]`, props, slots, slot fallback |
| `loops` | `[for-each]` with `i`, nesting, `[for-each]` over zero or one item as a conditional |
| `build-time` | `${ }$` with `node:fs`, an npm package, `ArcMoon.version`, `{ raw }` |
| `reactivity` | signals, `computed`, live text, attributes, classes and events, `export` → runtime |
| `refs` | `arcm-ref`, and `arcm-shared-ref` collected from many components |
| `browser-code` | npm in runtime code (`bundle`), a local module, a `[script = src]` file |
| `styles` | scoped component CSS, `--name` props (build time and live), a live `[style]` |
| `syntax` | escapes, `arcm-raw`, comments, numbers and booleans in props |

Every page also uses:
- **the layout** (`src/layouts/Layout.arcm`): its title, description and previous/next links come from `src/data/pages.json`. It also has an inline `[script]`, a single ref for the theme button, and `:global(.dark)`;
- **`src/styles/main.css`**, linked from the layout and bundled into each page with its `@import` and `url()` image.
