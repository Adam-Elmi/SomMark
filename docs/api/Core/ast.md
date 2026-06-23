# ast

A pre-built Abstract Syntax Tree (AST) array that bypasses the lexer and parser.
---

**Syntax:**
```js
// 1. In engine options
new SomMark({ ast, format })

// 2. In transpile options
transpile({ ast, format })
```

**Usage:**
```js
import { transpile } from "sommark";

const output = await transpile({
  ast: [
    {
      type: "Block",
      id: "h1",
      props: {},
      body: [{ type: "Text", text: "Hello AST!" }]
    }
  ],
  format: "html"
});
console.log(output);
// Output: <h1>Hello AST!</h1>
```

---

### Example: Custom Dynamic AST Generation

Providing a pre-built `ast` overrides `src` entirely, allowing programmatic content construction:

```javascript
import SomMark from "sommark";

const smark = new SomMark({
  src: "[p]This will be ignored[end:p]",
  ast: [
    {
      type: "Block",
      id: "p",
      props: {},
      body: [{ type: "Text", text: "Dynamic injected body" }]
    }
  ],
  format: "html"
});

const output = await smark.transpile();
console.log(output);
// Output: <p>Dynamic injected body</p>
```

### Example: Validation and Errors

Either `src` or `ast` must be provided when calling `transpile`. Omitting both throws a descriptive `Runtime Error`:

```javascript
import { transpile } from "sommark";

try {
  await transpile({ format: "html" });
} catch (err) {
  console.error(err.message);
  // Output: Either 'src' or 'ast' must be provided for transpilation.
}
```

[Read parse.md for generating ASTs from templates](parse.md)

[Read transpile.md for compiling templates](transpile.md)
