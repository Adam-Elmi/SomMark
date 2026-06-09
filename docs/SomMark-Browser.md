# SomMark in the Browser

SomMark can compile templates directly in the browser. No Node.js is needed. It works with any bundler — Vite, Webpack, Rollup, and esbuild — or directly from a CDN with no build step.

---

## CDN (no build step)

Load SomMark directly in any HTML page using a `<script type="module">` tag:

```html
<script type="module">
  import SomMark, { resolveBaseDir, renderCompiledHTML }
    from "https://cdn.jsdelivr.net/npm/sommark@4.3.0/dist/sommark.browser.js";

  const src = await fetch("./main.smark").then(r => r.text());

  const engine = new SomMark({
    src,
    format: "html",
    baseDir: resolveBaseDir("./templates/"),
  });

  renderCompiledHTML(document.getElementById("output"), await engine.transpile());
</script>
```

**CDN URLs**

| Provider  | URL |
|-----------|-----|
| jsDelivr  | `https://cdn.jsdelivr.net/npm/sommark@4.3.0/dist/sommark.browser.js` |
| unpkg     | `https://unpkg.com/sommark@4.3.0/dist/sommark.browser.js` |

> Replace `4.2.0` with the version you want. The `dist/sommark.browser.js` file is the pre-bundled build — all dependencies are included. WASM files are served from the same `dist/` directory automatically via `import.meta.url`.
>
> The `index.browser.js` entry is for use with a bundler (Vite, Webpack, etc.) and will not work directly in a browser.

---

## Install (with a bundler)

```bash
npm install sommark
```

## Import

Use the browser entry point instead of the default one:

```js
// browser
import SomMark, { resolveBaseDir, renderCompiledHTML } from "sommark/browser";
```

---

## Basic Usage

```js
// browser
import SomMark, { resolveBaseDir, renderCompiledHTML } from "sommark/browser";

const src = await fetch("./main.smark").then(r => r.text());

const engine = new SomMark({
  src,
  format: "html",
  baseDir: resolveBaseDir("./templates/"),
});

const html = await engine.transpile();
renderCompiledHTML(document.getElementById("output"), html);
```

---

## Helpers

### `resolveBaseDir(path)`

Turns a relative path into a full URL so SomMark can fetch imported modules.

```js
resolveBaseDir("./templates/")
// → "https://example.com/templates/"
```

It uses `document.baseURI` at runtime. This works with all bundlers because it is not resolved at build time.

Pass the result as the `baseDir` option:

```js
new SomMark({
  src,
  baseDir: resolveBaseDir("./templates/"),
});
```

---

### `renderCompiledHTML(container, html)`

Writes compiled HTML into a DOM element and runs any `<script>` tags inside it.

Browsers block scripts injected via `innerHTML`. This helper replaces each `<script>` with a live one so they execute normally.

```js
renderCompiledHTML(document.getElementById("output"), html);
```

---

## Module Imports

When `baseDir` is an `http(s)://` URL, SomMark automatically uses `FetchFS` to load imported modules via `fetch`.

```js
// templates/page.smark
[import = Card: "./Card.smark"][end]
[Card = title: "Hello" !]
```

```js
new SomMark({
  src,
  baseDir: resolveBaseDir("./templates/"),
  format: "html",
});
```

SomMark fetches `./Card.smark` relative to the `baseDir` URL. Each file is cached so it is only fetched once per compilation.

---

## In-Memory Files

Use the `files` option to provide module content directly, without any network requests. This is useful for testing or when files are bundled inline.

```js
new SomMark({
  src: '[import = Card: "/Card.smark"][end]\n[Card = title: "Hello" !]',
  format: "html",
  files: {
    "/Card.smark": "[div = class: 'card'][h2]v{title}[end][end]",
  },
});
```

---

## Bundler Notes

| Bundler | Works out of the box |
|---------|----------------------|
| Vite    | Yes |
| Webpack | Yes |
| Rollup  | Yes — needs a WASM asset plugin for QuickJS |
| esbuild | Yes — needs a WASM asset plugin for QuickJS |

See `browser-test/` in the repo for working config examples for each bundler.

---

## API Reference

| Export | Description |
|--------|-------------|
| `SomMark` (default) | The compiler class. Same API as Node.js. |
| `resolveBaseDir(path)` | Resolves a relative path to a full URL. |
| `renderCompiledHTML(container, html)` | Injects HTML and activates script tags. |

Full docs: [`docs/api/Browser/`](api/Browser/)
