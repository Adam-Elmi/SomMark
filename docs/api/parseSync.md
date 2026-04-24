# parseSync

`parseSync` is the synchronous version of the parser. It turns raw SomMark source into an **Abstract Syntax Tree (AST)** immediately.

---

## 1. Quick Usage

Unlike the async `parse` method, `parseSync` allows you to pass a full configuration object as the second argument.

```js
import { parseSync } from "sommark";

const ast = parseSync("[h1]Hello World[end]", {
    format: "mdx",
    placeholders: { user: "Adam" }
});
```

---

## 2. Standalone Signature

### `parseSync(src, options = {})`

The `options` object supports:
*   **`format`**: Target output format (e.g., `"html"`, `"markdown"`).
*   **`placeholders`**: Data for `p{}` lookups.
*   **`mapperFile`**: A custom Mapper instance for structural validation.
*   **`filename`**: Source identifier for error reporting.

---

## 3. Usage in Instance

When using a `SomMark` instance, `parseSync` uses the configuration already provided to the constructor.

```js
const sm = new SomMark({ 
    src: "[h1]Hello[end]", 
    format: "html" 
});

const ast = sm.parseSync();
```

---

## 4. The "No Modules" Limitation

Because file systems and external requests are async, **`parseSync` cannot resolve modules.**

*   If your code contains **`[import]`** or **`[$use-module]`**, the parser will see the blocks but will **not** import the external files.
*   **Tip**: If your project relies on imports/modules, you **must** use the async [parse](parse.md) method.

---

## 5. Performance Note

`parseSync` skips the event loop and the module resolution layer, making it the fastest way to parse small, self-contained strings within a synchronous function.
