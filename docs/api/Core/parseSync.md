# parseSync()

Turns raw SomMark source code into an Abstract Syntax Tree (AST) synchronously.

> [!NOTE]
> `parseSync` is a lightweight, pure parser that does not resolve asynchronous modular imports (`$use-module` / `import`). To resolve module dependencies, use the asynchronous [parse](parse.md) method instead.
---

**Syntax:**
```js
parseSync(src, filename?)
```

**Usage:**
```js
import { parseSync } from "sommark";

const ast = parseSync("[h1]Hello[end]");
```

---

### Example: Synchronous Parsing

Generates a stateless syntax tree instantly on the CPU thread, ideal for CLI tools and linters:

```javascript
import { parseSync } from "sommark";

const ast = parseSync("[p]Welcome[end]", "index.smark");
console.log(ast[0]);
/*
Output:
{
  type: "BLOCK",
  id: "p",
  args: {},
  body: [
    { type: "TEXT", text: "Welcome", ... }
  ],
  range: {
    start: { line: 0, character: 0 },
    end: { line: 0, character: 15 }
  }
}
*/
```

### Example: Validation of Missing or Non-String Inputs

Synchronous parsing validates inputs strictly and throws descriptive `Runtime Error` exceptions:

```javascript
import { parseSync } from "sommark";

try {
  parseSync(undefined);
} catch (error) {
  console.error(error);
  // Output: [Runtime Error]: Missing Source: The 'src' argument is required for parsing.
}

try {
  parseSync(42);
} catch (error) {
  console.error(error);
  // Output: [Runtime Error]: Invalid Source Type: The 'src' argument must be a string, received number.
}
```

[Read parse.md for the asynchronous modular version](parse.md)

[Read lexSync.md for synchronous tokenization](lexSync.md)
