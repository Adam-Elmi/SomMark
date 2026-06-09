# resolveBaseDir()

Resolves a relative path into an absolute URL using the current document location. Use this to set `baseDir` when loading `.smark` modules via fetch in the browser.

---

**Syntax:**
```js
resolveBaseDir(relativePath?)
```

**Usage:**
```js
import SomMark, { resolveBaseDir } from "sommark/browser";

const src = await fetch("./main.smark").then(r => r.text());

const engine = new SomMark({
    src,
    format: "html",
    baseDir: resolveBaseDir("./templates/")
});

const html = await engine.transpile();
```

---

### Why It's Needed

When SomMark resolves `[import = ...]` module paths in the browser, it needs to know **where to fetch them from**. Without `baseDir`, there is no base URL to resolve relative paths against.

`resolveBaseDir("./templates/")` turns that relative path into a full URL like `https://mysite.com/templates/` using the current page's address (`document.baseURI`).

Using `document.baseURI` (rather than `import.meta.url`) makes it safe with all bundlers — Webpack resolves `import.meta.url` at build time as a static asset, which breaks at runtime.

---

### Example: Module Imports Across Pages

When your templates live at a different path than your HTML, pass the directory that contains them:

```js
import SomMark, { resolveBaseDir } from "sommark/browser";

// Page is at: https://example.com/pages/about.html
// Templates are at: https://example.com/templates/
const baseDir = resolveBaseDir("../templates/");
// → "https://example.com/templates/"

const src = await fetch(baseDir + "about.smark").then(r => r.text());

const engine = new SomMark({ src, format: "html", baseDir });
const html = await engine.transpile();
```

---

### Errors

`resolveBaseDir` throws a descriptive error in three cases:

**1. Called outside a browser environment:**
```js
// In Node.js — no `document` object
resolveBaseDir("./templates/");
// Throws: [SomMark] resolveBaseDir() can only be called in a browser environment.
//         In Node.js, pass a file path directly as 'baseDir' instead.
```

**2. Empty or missing argument:**
```js
resolveBaseDir("");
// Throws: [SomMark] resolveBaseDir() expects a non-empty string path, but received: ""
```

**3. URL construction failure:**
```js
resolveBaseDir(":::bad-path");
// Throws: [SomMark] resolveBaseDir() could not resolve path ':::bad-path' against document URL '...'
```

---

> [!NOTE]
> In Node.js, `baseDir` accepts a plain file path string — `resolveBaseDir` is not needed and will throw if called there. Pass the directory path directly: `new SomMark({ src, format: "html", baseDir: "./templates" })`.

---

[Read baseDir.md for the baseDir option details](../Core/baseDir.md)

[Read renderCompiledHTML.md for injecting compiled output into the DOM](renderCompiledHTML.md)
