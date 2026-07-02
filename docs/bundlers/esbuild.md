# SomMark with esbuild

Add `sommarkEsbuild()` to your plugins array. The plugin handles QuickJS WASM assets automatically — no extra boilerplate needed.

---

## Install

```bash
npm install sommark esbuild
```

---

## Config

esbuild is configured via a script file, not a static config:

```js
// esbuild.config.mjs
import * as esbuild from "esbuild";
import { sommarkEsbuild } from "sommark/esbuild";

await esbuild.build({
    entryPoints: ["main.js"],
    bundle: true,
    format: "esm",
    target: "esnext",   // required — SomMark uses top-level await
    outdir: "dist",
    splitting: true,    // required — see note below
    platform: "browser",
    plugins: [sommarkEsbuild()],
});
```

Run it:

```bash
node esbuild.config.mjs
```

---

## Dev Server

esbuild has a built-in dev server:

```js
// esbuild.config.mjs
import * as esbuild from "esbuild";
import { sommarkEsbuild } from "sommark/esbuild";

const isWatch = process.argv.includes("--watch");
const outdir = "dist";

const config = {
    entryPoints: ["main.js"],
    bundle: true,
    format: "esm",
    target: "esnext",
    outdir,
    splitting: true,
    platform: "browser",
    plugins: [sommarkEsbuild()],
};

if (isWatch) {
    const ctx = await esbuild.context(config);
    await ctx.watch();
    const { port } = await ctx.serve({ servedir: outdir, host: "localhost", port: 3000 });
    console.log(`Dev server: http://localhost:${port}`);
} else {
    await esbuild.build(config);
}
```

```bash
node esbuild.config.mjs --watch
```

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

## Why `splitting: true` Is Required

SomMark imports QuickJS as a dynamic dependency. Without code splitting, esbuild inlines everything into one file — including code that relies on `import.meta.url` being the correct module URL for WASM resolution. With splitting, each chunk keeps its own `import.meta.url` and the WASM paths resolve correctly.

---

[← Rollup](rollup.md) | [Bundler Overview](overview.md) | [Webpack →](webpack.md)
