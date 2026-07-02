# lexSync()

Breaks raw SomMark source code into a list of tokens synchronously.

---

**Syntax:**
```js
lexSync(src, filename?)
```

**Usage:**
```js
import { lexSync } from "sommark";

const tokens = lexSync("[h1]Hello[end:h1]");
```

---

### Example: Synchronous Tokenization

Perfect for real-time syntax highlighters, linter plugins, or CPU-bound scripts:

```javascript
import { lexSync } from "sommark";

const tokens = lexSync("[h1]Hello[end:h1]", "main.smark");
console.log(tokens[0]);
/*
Output:
{
  type: "OPEN_BRACKET",
  value: "[",
  source: "main.smark",
  range: {
    start: { line: 0, character: 0 },
    end: { line: 0, character: 1 }
  }
}
*/
```

### Example: Strict Argument Validation

Like its asynchronous counterpart, `lexSync` throws a descriptive `Runtime Error` on invalid inputs:

```javascript
import { lexSync } from "sommark";

try {
  lexSync(undefined);
} catch (error) {
  console.error(error);
  // Output: [Runtime Error]: Missing Source: The 'src' argument is required for tokenization.
}

try {
  lexSync({ src: "hello" });
} catch (error) {
  console.error(error);
  // Output: [Runtime Error]: Invalid Source Type: The 'src' argument must be a string, received object.
}
```

[Read lex.md for the asynchronous version](lex.md)

[Read parseSync.md for more info on synchronous parsing](parseSync.md)
