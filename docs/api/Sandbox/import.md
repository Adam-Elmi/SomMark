# import()

Loads a local file at compile time and splices its content directly into the runtime script block as a literal value.

---

**Syntax:**
```js
SomMark.import(filePath);
```

**Usage:**
```javascript
runtime ${
  const locales = SomMark.import("./locales.json");
  console.log("Greeting:", locales.welcome);
}$
```

---

### How It Works

1. **Scans the block:** The preprocessor scans `runtime ${ ... }$` blocks before compilation to locate `SomMark.import(...)` calls.
2. **Resolves the path:** The path is resolved relative to the template file's directory (or `process.cwd()` if compiling anonymously).
3. **Reads and serializes:**
   - **`.json` files** — parsed and serialized as a JavaScript object literal, available synchronously at runtime.
   - **All other files** — read as text and serialized as a JSON-escaped string literal.
4. **Splices inline:** The serialized value replaces the `SomMark.import(...)` call in the script before the `<script>` tag is written.

The result is synchronous access to file data at runtime with no `fetch` or `await` needed.

---

### Path Rules

- **Relative paths only** — absolute paths (`/etc/data.json`) are blocked and throw a security error.
- **No path traversal** — paths that escape the template's directory (`../../secret.json`) are blocked.
- **Static string required** — the path must be a string literal or a static template literal. Dynamic expressions cannot be resolved at compile time.

```js
SomMark.import("./data.json")        // ✓
SomMark.import(`./data.json`)        // ✓ static template literal
SomMark.import("/etc/passwd")        // ✗ blocked — absolute path
SomMark.import("../../secret.json")  // ✗ blocked — path traversal
SomMark.import(`./\${name}.json`)    // ✗ not resolvable at compile time
```

---

### Security

- **`allowedExtensions`** — if set in `security`, only the listed file extensions can be imported. Any other extension throws a security error.
- Absolute paths and path traversal are always blocked regardless of security settings.

---

### Important: Runtime Blocks Only

`SomMark.import` is preprocessed only inside `runtime ${ ... }$` blocks. Calling it inside a `static ${ ... }$` block throws an error because the static sandbox has no preprocessor.

Inside `static ${ ... }$` blocks, use native ES module imports instead:

```js
static ${
  import pkg from "./package.json";
  return pkg.version;
}$
```

---

### Example: Embedding a JSON Config

**locales.json:**
```json
{ "hello": "Welcome to SomMark!" }
```

**index.smark:**
```ini
[div = class: "app"]
  runtime ${
    const locales = SomMark.import("./locales.json");
    console.log(locales.hello);
  }$
[end:div]
```

**Output:**
```html
<div class="app">
  <script>
    /* global SomMark */
    if (typeof globalThis.SomMark === 'undefined') { globalThis.SomMark = { static: (c) => c, import: (c) => c }; }
    (async function(){
      const locales = {"hello":"Welcome to SomMark!"};
      console.log(locales.hello);
    })();
  </script>
</div>
```

---

### Example: Embedding a Text File

```js
runtime ${
  const readme = SomMark.import("./README.md");
  document.getElementById("docs").textContent = readme;
}$
```

`readme` is a plain string containing the raw file contents.

---

[Read static.md for compile-time expression baking](static.md)

[Read settings.md for global configuration access](settings.md)

[Read fetch.md for secure compile-time HTTP requests](fetch.md)
