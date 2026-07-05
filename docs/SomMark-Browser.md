# SomMark in the Browser

SomMark can compile templates directly in the browser. No Node.js is needed. It works with any bundler — Vite, Webpack, Rollup, and esbuild — or directly from a CDN with no build step.

---

## CDN (no build step)

Load SomMark directly in any HTML page using a `<script type="module">` tag:

```html
<div id="output"></div>
<script type="module">
  import SomMark, { renderCompiledHTML }
    from "https://cdn.jsdelivr.net/npm/sommark@5.2.0/dist/sommark.browser.js";

  const src = "[h1 = color: green]Compiled successfully ✓[end:h1]";

  const engine = new SomMark({
    src,
    format: "html",
  });

  renderCompiledHTML(document.getElementById("output"), await engine.transpile());
</script>
```

**CDN URLs**

| Provider  | URL |
|-----------|-----|
| jsDelivr  | `https://cdn.jsdelivr.net/npm/sommark@5.2.0/dist/sommark.browser.js` |
| unpkg     | `https://unpkg.com/sommark@5.2.0/dist/sommark.browser.js` |

> Replace `5.2.0` with the version you want. The `dist/sommark.browser.js` file is the pre-bundled build — all dependencies are included. WASM files are served from the same `dist/` directory automatically via `import.meta.url`.
>
> The `index.browser.js` entry is for use with a bundler (Vite, Webpack, etc.) and will not work directly in a browser.

> [!WARNING]
> **Avoid versions 5.0.4 and 5.0.5** — these are broken due to an internal bug and will not work correctly in the browser. **Versions 5.0.0 through 5.0.3** may appear to work but contain hidden bugs that can surface unexpectedly.
>
> **Use version 5.2.0** — this is the first stable browser release. All known issues from the 5.0.x line are fixed.
> Avoid **version 5.1.0**: this version has security issue, it exposes internal compiler settings to the sandbox. Upgrade to v5.2.0 or higher versions.
---

## Local Bundle (no CDN, no bundler)

If you do not want to rely on a CDN and you are not using a bundler, you can copy the SomMark browser files directly into your project using the `sommark bundle` CLI command.

> **Requirement:** Your project must be served over HTTP — a local dev server, or any web server. This does not work when you open HTML files directly from your filesystem (`file://` protocol) because browsers block ES module imports under that protocol.

### Full bundle

Copies the complete SomMark browser build — all JS files and WASM files — into a folder in your project:

```bash
sommark bundle ./public/sommark
```

Your project folder will look like this:

```
your-project/
  public/
    sommark/
      sommark.browser.js
      module-[hash].js
      ffi-[hash].js
      emscripten-module.browser-[hash].js
      assets/
        *.wasm
  index.html
```

Then import from it in your HTML:

```html
<script type="module">
  import SomMark from "./public/sommark/sommark.browser.js";

  const engine = new SomMark({ src: "...", format: "html" });
  document.getElementById("output").innerHTML = await engine.transpile();
</script>
```

All features work — including `static ${}$` and `runtime ${}$` blocks that require the QuickJS VM.

### Lite bundle

If your templates do not use `static ${}$` or `runtime ${}$` blocks, you can use the lite bundle instead. It is a single JS file with no WASM — faster to load and easier to ship:

```bash
sommark bundle ./public/sommark --lite
```

Your project folder will look like this:

```
your-project/
  public/
    sommark/
      sommark.browser.lite.js
  index.html
```

Then import from it:

```html
<script type="module">
  import SomMark from "./public/sommark/sommark.browser.lite.js";

  const engine = new SomMark({ src: "...", format: "html" });
  document.getElementById("output").innerHTML = await engine.transpile();
</script>
```

**What the lite bundle excludes:**

| Feature | Full bundle | Lite bundle |
|---------|-------------|-------------|
| Lexer, parser, transpiler | ✓ | ✓ |
| All block types | ✓ | ✓ |
| Module system (`[import]`) | ✓ | ✓ |
| `static ${}$` blocks | ✓ | ✗ — throws an error |
| `runtime ${}$` blocks | ✓ | ✗ — throws an error |
| QuickJS VM (WASM) | ✓ | ✗ — not included |

### Lexer-only bundle

If you only need to tokenize SomMark source — for example to build a syntax highlighter, a linter, or a custom tool that reads tokens — the lexer bundle is all you need. It is a single 32 KB file:

```bash
sommark bundle ./public/sommark --only-lexer
```

**Exports:** `lexSync`, `lex`, `TOKEN_TYPES`, `labels`

```html
<script type="module">
  import { lexSync, TOKEN_TYPES } from "./public/sommark/sommark.lexer.js";

  const tokens = lexSync("[h1]Hello[end:h1]");
  console.log(tokens);
</script>
```

### Parser-only bundle

If you need to parse SomMark into an AST — for example to build a custom renderer, a static analysis tool, or a code transformer — use the parser bundle. It includes the lexer as well. It is a single 83 KB file:

```bash
sommark bundle ./public/sommark --only-parser
```

**Exports:** `lexSync`, `lex`, `parseSync`, `parse`, `TOKEN_TYPES`, `labels`

```html
<script type="module">
  import { parseSync } from "./public/sommark/sommark.parser.js";

  const ast = parseSync("[h1]Hello[end:h1]");
  console.log(ast);
</script>
```

### Bundle comparison

| Command | File | Size | Use when |
|---------|------|------|----------|
| `sommark bundle` | `sommark.browser.js` + WASM | ~5.2 MB | Full features including `static ${}$` and `runtime ${}$` |
| `sommark bundle --lite` | `sommark.browser.lite.js` | 456 KB | Full transpiler, no JS evaluation |
| `sommark bundle --only-parser` | `sommark.parser.js` | 83 KB | Need to parse SomMark into an AST |
| `sommark bundle --only-lexer` | `sommark.lexer.js` | 32 KB | Need tokens only — syntax highlighting, linting |

### When to use which

| Situation | Use |
|-----------|-----|
| Your templates use `static ${}$` or `runtime ${}$` | Full bundle |
| Your templates are pure markup — no JS evaluation | `--lite` |
| You are building a custom renderer or code tool | `--only-parser` |
| You are building a syntax highlighter or linter | `--only-lexer` |
| You are not sure | Full bundle |

### Starting a local server

Any local server works. The simplest option with no install required:

```bash
# Node.js
npx serve .

# Python
python3 -m http.server
```

Then open `http://localhost:3000` (or whichever port your server uses).

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
[import = Card: "./Card.smark" !]
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
  src: '[import = Card: "/Card.smark" !]\n[Card = title: "Hello" !]',
  format: "html",
  files: {
    "/Card.smark": "[div = class: 'card'][h2]v{title}[end:h2][end:div]",
  },
});
```

---

## Bundler Notes

| Bundler | Plugin | What it handles |
|---------|--------|----------------|
| Vite    | `sommark/vite` | Excludes QuickJS from dep optimization |
| Rollup  | `sommark/rollup` | Tree-shaking fix + WASM asset handling |
| esbuild | `sommark/esbuild` | WASM asset handling |
| Webpack | none needed | Enable `asyncWebAssembly` + `topLevelAwait` experiments |

See [`docs/bundlers/`](bundlers/overview.md) for full setup guides, or `browser-test/` in the repo for working config examples.

---

## API Reference

| Export | Description |
|--------|-------------|
| `SomMark` (default) | The compiler class. Same API as Node.js. |
| `resolveBaseDir(path)` | Resolves a relative path to a full URL. |
| `renderCompiledHTML(container, html)` | Injects HTML and activates script tags. |

Full docs: [`docs/api/Browser/`](api/Browser/)
