# SomMark with Webpack

No separate plugin package needed. Add two experiment flags, a `node:` URI fix, and a WASM asset rule directly in your config.

---

## Install

```bash
npm install sommark webpack webpack-cli html-webpack-plugin
```

---

## Config

```js
// webpack.config.cjs
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",
    entry: "./main.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        clean: true,
    },
    experiments: {
        asyncWebAssembly: true,  // required — QuickJS loads WASM asynchronously
        topLevelAwait: true,     // required — SomMark uses top-level await
    },
    resolve: {
        fallback: {
            fs: false,           // preprocessor.js imports node:fs at runtime — stub it out
        },
    },
    plugins: [
        // Webpack does not understand the node: URI scheme — strip it so fallbacks apply
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
            resource.request = resource.request.replace(/^node:/, "");
        }),
        new HtmlWebpackPlugin({ template: "./index.html" }),
    ],
    module: {
        rules: [
            {
                test: /\.wasm$/,
                type: "asset/resource",  // emit .wasm files as separate files
            },
        ],
    },
};
```

---

## Dev Server

```bash
npm install --save-dev webpack-dev-server
```

Add a `devServer` section:

```js
devServer: {
    port: 3000,
    static: [
        { directory: path.resolve(__dirname, "templates"), publicPath: "/templates" },
        { directory: path.resolve(__dirname, "public"),    publicPath: "/public" },
    ],
    hot: true,
},
```

```bash
npx webpack serve --config webpack.config.cjs
```

---

## Build

```bash
npx webpack --config webpack.config.cjs
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

## What Each Setting Does

| Setting | Why it is needed |
|---------|-----------------|
| `asyncWebAssembly: true` | Allows Webpack to handle `.wasm` files that are loaded asynchronously, which is how QuickJS loads them |
| `topLevelAwait: true` | SomMark's browser entry uses top-level `await` during initialization |
| `fallback: { fs: false }` | SomMark's preprocessor does a dynamic `import("node:fs")` at runtime — in the browser this path is never reached, so stubbing it out is safe |
| `NormalModuleReplacementPlugin` | Webpack does not understand the `node:` URI scheme. This strips the prefix so the `fs: false` fallback can be applied |

---

[← esbuild](esbuild.md) | [Bundler Overview](overview.md)
