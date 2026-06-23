# parse()

Turns raw SomMark source code into an Abstract Syntax Tree (AST) asynchronously, resolving external modules and imports.
---

**Syntax:**
```js
parse(src, filename?)
```

**Usage:**
```js
import { parse } from "sommark";

const ast = await parse("[h1]Hello[end:h1]");
```

---

### Example: Parsing a Basic Document

Parsing standard structural code returns a nested AST node array:

```javascript
import { parse } from "sommark";

const ast = await parse("[div = class: \"card\"]Content[end:div]", "card.smark");
console.log(ast[0]);
/*
Output:
{
  type: "BLOCK",
  id: "div",
  props: { "0": "card", class: "card" },
  body: [
    { type: "TEXT", text: "Content", ... }
  ],
  range: {
    start: { line: 0, character: 0 },
    end: { line: 0, character: 32 }
  }
}
*/
```

### Example: Validation of Missing or Non-String Inputs

Calling `parse` with `null`, `undefined`, or non-string inputs throws a descriptive `Runtime Error` immediately:

```javascript
import { parse } from "sommark";

try {
  await parse(null);
} catch (error) {
  console.error(error);
  // Output: [Runtime Error]: Missing Source: The 'src' argument is required for parsing.
}

try {
  await parse({});
} catch (error) {
  console.error(error);
  // Output: [Runtime Error]: Invalid Source Type: The 'src' argument must be a string, received object.
}
```

[Read parseSync.md for the synchronous version](parseSync.md)

[Read lex.md for the tokenization pipeline step](lex.md)
