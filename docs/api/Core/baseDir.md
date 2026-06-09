# baseDir

The root directory (or URL) used to resolve relative import paths in `[import = ...]` statements.

---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format, baseDir })

// 2. In transpile options
transpile({ src, format, baseDir })
```

**Usage:**
```js
import SomMark from "sommark";

const engine = new SomMark({
    src,
    format: "html",
    baseDir: "./templates"
});
```

---

### How baseDir Is Resolved

`baseDir` is optional in most cases. The engine derives it automatically based on context:

| Context | Default resolution |
|:---|:---|
| `filename` is provided | `path.dirname(filename)` — imports resolve relative to the template file |
| No `filename` (anonymous) | `process.cwd()` in Node.js, `"/"` in browser |
| `baseDir` is set explicitly | Always overrides the above |

In Node.js, passing `filename` is usually enough — `baseDir` is derived from it automatically:

```js
import SomMark from "sommark";
import { readFileSync } from "node:fs";

const engine = new SomMark({
    src: readFileSync("./src/pages/index.smark", "utf-8"),
    format: "html",
    filename: "./src/pages/index.smark"
    // baseDir is derived as "./src/pages" automatically
});
```

---

### Browser Usage

In the browser, `baseDir` must be an `http://` or `https://` URL. SomMark automatically creates a `FetchFS` from it and fetches imported modules via the browser's `fetch` API.

Use `resolveBaseDir()` from `sommark/browser` to construct the URL from a relative path:

```js
import SomMark, { resolveBaseDir } from "sommark/browser";

const src = await fetch("./main.smark").then(r => r.text());

const engine = new SomMark({
    src,
    format: "html",
    baseDir: resolveBaseDir("./templates/")
    // e.g. "https://example.com/templates/"
});
```

When `baseDir` is a URL, SomMark fetches imported `.smark` files on demand and caches them so the same file is never requested twice within a single compilation.

---

### Example: Explicit baseDir Override

Use `baseDir` explicitly when the template is loaded from a different location than where its imports live:

```js
import SomMark from "sommark";
import { readFileSync } from "node:fs";

const src = readFileSync("./dist/compiled/index.smark", "utf-8");

const engine = new SomMark({
    src,
    format: "html",
    // Imports resolve from ./src/templates/, not ./dist/compiled/
    baseDir: "./src/templates"
});
```

---

[Read filename.md for automatic baseDir derivation from a file path](filename.md)

[Read files.md for the in-memory alternative to disk/fetch resolution](files.md)

[Read importAliases.md for custom path aliases](importAliases.md)

[Read resolveBaseDir.md for browser URL resolution](../Browser/resolveBaseDir.md)
