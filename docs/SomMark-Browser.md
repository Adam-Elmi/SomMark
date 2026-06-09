# SomMark in the Browser

SomMark can compile templates directly in the browser. No Node.js is needed. It works with any bundler — Vite, Webpack, Rollup, and esbuild.

---

## Install

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
