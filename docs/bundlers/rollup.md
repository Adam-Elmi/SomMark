# SomMark with Rollup

Add `sommarkRollup()` to your plugins array. The plugin handles both QuickJS tree-shaking and WASM assets automatically.

---

## Install

```bash
npm install sommark
npm install --save-dev rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs
```

---

## Config

```js
// rollup.config.js
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { sommarkRollup } from "sommark/rollup";

export default {
    input: "main.js",
    output: {
        dir: "dist",
        format: "es",
        chunkFileNames: "[name]-[hash].js",
    },
    plugins: [
        sommarkRollup(),
        commonjs(),
        nodeResolve({ browser: true }),
    ],
};
```

`sommarkRollup()` must come before `commonjs()` and `nodeResolve()`.

---

## Usage

In your application code, import from `sommark/browser`:

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

---

## Build

```bash
npx rollup -c rollup.config.js
```

For watch mode:

```bash
npx rollup -c --watch
```

---

## What `sommarkRollup()` Does

**Tree-shaking fix** — Rollup incorrectly marks QuickJS modules (`quickjs-emscripten`, `@jitl/*`) as side-effect-free and removes their initialization code. The plugin overrides `treeshake.moduleSideEffects` to always keep them.

**WASM assets** — QuickJS loads its `.wasm` files via `new URL("*.wasm", import.meta.url)`. Rollup does not copy or rewrite these patterns automatically. The plugin detects them during the `transform` step, emits the `.wasm` files as build assets, and rewrites the URLs to point to the correct output paths.

---

[← Vite](vite.md) | [Bundler Overview](overview.md) | [esbuild →](esbuild.md)
