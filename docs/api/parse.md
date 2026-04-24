# parse

The `parse` method turns raw SomMark source into an **Abstract Syntax Tree (AST)**. This is an asynchronous operation because it handles module resolution (**`[import]`** and **`[$use-module]`**).

---

## 1. Standalone Function (Direct Import)

This is a quick way to parse code that might use external modules. It accepts a **filename** as the second argument for better error reporting.

### Signature: `parse(src, filename = "anonymous")`

```js
import { parse } from "sommark";

// Simple self-contained string
const ast = await parse("[h1]Hello World[end]");

// Example with modules (requires 'utils.smark' to exist on disk)
const moduleAst = await parse("[import = myMod: 'utils.smark'] [$use-module = myMod]", "main.sm");
```

> [!IMPORTANT]
> When using **`[import]`**, the referenced file (e.g., `'utils.smark'`) **must exist** on your file system. If the file is missing, the parser will throw a `Module Path Error`.

---

## 2. Instance Method (Class Member)

When using a `SomMark` instance, the method inherits its configuration (like placeholders and filename) from the constructor.

### Signature: `sm.parse(src = this.src)`

```js
import SomMark from "sommark";

const sm = new SomMark({ 
    format: "mdx",
    filename: "main.smark",
    placeholders: { user: "Adam" }
});

// Inherits config from 'sm'
const ast = await sm.parse();
```

---

## 3. What happens during Parsing?

1.  **Tokenization**: The engine breaks the source into tokens.
2.  **Tree Building**: It organizes tokens into a nested JSON structure.
3.  **Module Resolution**: It searches for **`[import]`** and **`[$use-module]`** blocks and merges external files into the tree.
4.  **Validation**: It runs the `Validator` to ensure the structure matches your mapper rules.

---

## 4. Why use Async Parse?

*   **Internal modules**: If your document uses **`[import]`** or **`[$use-module]`** to include other files, you **must** use the async `parse` method.
*   **Structural analysis**: Use `parse` if you need to analyze or modify the tree before rendering it with the [transpile](transpile.md) method.
