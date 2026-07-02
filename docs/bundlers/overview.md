# SomMark with Bundlers

SomMark ships a small plugin for each major bundler. The plugin handles one thing: making sure QuickJS (the WebAssembly sandbox SomMark uses to run compile-time scripts) survives the bundler's tree-shaking and asset handling.

---

## Why a Plugin Is Needed

QuickJS loads `.wasm` files at runtime using `new URL("*.wasm", import.meta.url)`. Bundlers handle these URL patterns differently, and some will strip code they think is unused (tree-shaking). Without the plugin, the bundled output either misses the WASM files or crashes at runtime.

The plugins are small — they fix only what each bundler gets wrong.

---

## Bundler Support

| Bundler | Import | What the plugin does |
|---------|--------|----------------------|
| **Vite** | `sommark/vite` | Excludes QuickJS from dep optimization |
| **Rollup** | `sommark/rollup` | Prevents QuickJS from being tree-shaken |
| **esbuild** | `sommark/esbuild` | Entry point — WASM assets need a separate plugin |
| **Webpack** | none needed | Enable `asyncWebAssembly` and `topLevelAwait` experiments |

---

## Quick Start

Install SomMark:

```bash
npm install sommark
```

Then follow the guide for your bundler:

- [Vite](vite.md)
- [Rollup](rollup.md)
- [esbuild](esbuild.md)
- [Webpack](webpack.md)

---

## Common Pattern

Every bundler setup follows the same three steps:

1. **Install** SomMark
2. **Add the plugin** to your bundler config
3. **Import from `sommark/browser`** in your app code (not the default entry — the browser entry is for browser builds)

```js
// In your app code — always use the browser entry
import SomMark, { resolveBaseDir, renderCompiledHTML } from "sommark/browser";
```

The default `sommark` entry is for Node.js. Using it in a browser build will pull in Node.js-specific code that bundlers cannot resolve.

---

[← Back to Browser Guide](../SomMark-Browser.md)
