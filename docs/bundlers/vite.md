# SomMark with Vite

Vite works with SomMark almost out of the box. The only issue is that Vite's dependency optimizer (`optimizeDeps`) tries to pre-bundle QuickJS, which breaks its WebAssembly loading. The `sommarkVite()` plugin tells Vite to leave QuickJS alone.

---

## Install

```bash
npm install sommark
```

---

## Config

```js
// vite.config.js
import { defineConfig } from "vite";
import { sommarkVite } from "sommark/vite";

export default defineConfig({
    build: {
        target: "esnext",   // required — SomMark uses top-level await
    },
    plugins: [sommarkVite()],
});
```

That is the entire config. Vite handles WASM files and ES modules automatically.

---

## Usage

In your application code, import from `sommark/browser` — not the default `sommark` entry:

```js
import SomMark, { resolveBaseDir, renderCompiledHTML } from "sommark/browser";

const src = await fetch("./templates/main.smark").then(r => r.text());

const compiler = new SomMark({
    src,
    format: "html",
    baseDir: resolveBaseDir("./templates/"),
});

const html = await compiler.transpile();
renderCompiledHTML(document.getElementById("output"), html);
```

> `resolveBaseDir("./templates/")` converts the relative path to a full URL at runtime so SomMark can fetch imported `.smark` modules. Always pass it as `baseDir` when your templates use `[import]`.

---

## Dev Server

```bash
npx vite
```

Vite's dev server works without any extra steps.

---

## What `sommarkVite()` Does

It adds `quickjs-emscripten` to `optimizeDeps.exclude`. Without this, Vite tries to pre-bundle QuickJS into a CommonJS format, which breaks its internal WASM URL resolution.

```js
// What the plugin returns internally
{
    optimizeDeps: {
        exclude: ["quickjs-emscripten"]
    }
}
```

---

[← Bundler Overview](overview.md) | [Rollup →](rollup.md)
