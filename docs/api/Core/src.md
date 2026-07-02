# src

The raw, uncompiled SomMark template string.

---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format })

// 2. In transpile options
transpile({ src, format })

// 3. In lex/parse helpers
lex(src, filename?)
parse(src, filename?)
```

**Usage:**
```js
import { transpile } from "sommark";

const output = await transpile({
  src: "[h1]Hello World[end:h1]",
  format: "html"
});
```

---

### Example: Validation and Errors

The `src` argument must strictly be a string. Omitting it or passing non-string values throws a descriptive `Runtime Error`:

```javascript
import { lex } from "sommark";

// Throws: Missing Source
try {
  await lex(null);
} catch (err) {
  console.error(err.message);
  // Output: The 'src' argument is required for tokenization.
}

// Throws: Invalid Source Type
try {
  await lex(123);
} catch (err) {
  console.error(err.message);
  // Output: The 'src' argument must be a string, received number.
}
```

### Example: AST Override

When transpiling, providing a pre-built `ast` overrides `src` and bypasses the parsing phase entirely:

```javascript
import { transpile } from "sommark";

const output = await transpile({
  ast: [{ type: "Block", id: "h1", body: [{ type: "Text", text: "Hello" }] }],
  format: "html"
});
console.log(output);
// Output: <h1>Hello</h1>
```

[Read TOKEN_TYPES.md for how src is tokenized](TOKEN_TYPES.md)

[Read transpile.md for parsing templates](transpile.md)
