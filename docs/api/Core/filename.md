# filename

The name of the active file, used for providing detailed error logs and resolution contexts.
---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format, filename })

// 2. In transpile options
transpile({ src, format, filename })

// 3. In lex/parse helpers
lex(src, filename)
parse(src, filename)
```

**Usage:**
```js
import { transpile } from "sommark";

const output = await transpile({
  src: "[h1]Hello[end]",
  format: "html",
  filename: "components/Header.smark"
});
```

---

### Example: Error Report Traceability

Specifying a `filename` provides exact file context in compiler syntax errors:

```javascript
import { lex } from "sommark";

try {
  // Missing closing bracket error
  await lex("[h1 Hello", "src/views/Home.smark");
} catch (err) {
  console.error(err.message);
  // Contains trace details referencing "src/views/Home.smark"
}
```

---

### filename and Module Resolution

`filename` also drives automatic `baseDir` derivation. When you provide a `filename`, the engine sets the module resolution root to `path.dirname(filename)` — so all `[import = ...]` paths inside the template resolve relative to the template's own directory without needing to set `baseDir` explicitly.

```js
import SomMark from "sommark";
import { readFileSync } from "node:fs";

// Template at: src/pages/index.smark
// It imports:  [import = card: "./components/Card.smark" !]
const engine = new SomMark({
    src: readFileSync("./src/pages/index.smark", "utf-8"),
    format: "html",
    filename: "./src/pages/index.smark"
    // Imports resolve from ./src/pages/ automatically
    // No baseDir needed
});
```

If neither `filename` nor `baseDir` is provided, imports resolve from `process.cwd()` in Node.js and `"/"` in the browser.

---

[Read src.md for source input details](src.md)

[Read baseDir.md for explicit base directory override](baseDir.md)

[Read transpile.md for compiling templates](transpile.md)
