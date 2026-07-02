# lex()

Breaks raw SomMark source code into a list of tokens asynchronously.

---

**Syntax:**
```js
lex(src, filename?)
```

**Usage:**
```js
import { lex } from "sommark";

const tokens = await lex("[h1]Hello[end:h1]");
```

---

### Example: Standalone Tokenization

You can pass an optional `filename` to get accurate error reports:

```javascript
import { lex } from "sommark";

const tokens = await lex("[h1]Hello[end:h1]", "header.smark");
console.log(tokens[0]);
/*
Output:
{
  type: "OPEN_BRACKET",
  value: "[",
  source: "header.smark",
  range: {
    start: { line: 0, character: 0 },
    end: { line: 0, character: 1 }
  }
}
*/
```

### Example: Validation of Missing or Non-String Inputs

Calling `lex` with `null`, `undefined`, or non-string inputs throws a descriptive `Runtime Error` immediately:

```javascript
import { lex } from "sommark";

try {
  await lex(null);
} catch (error) {
  console.error(error);
  // Output: [Runtime Error]: Missing Source: The 'src' argument is required for tokenization.
}

try {
  await lex(123);
} catch (error) {
  console.error(error);
  // Output: [Runtime Error]: Invalid Source Type: The 'src' argument must be a string, received number.
}
```

[Read tokenTypes.md for the full list of token types](TOKEN_TYPES.md)

[Read parse.md for more info on parsing tokens](parse.md)
