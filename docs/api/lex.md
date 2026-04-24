# lex

The `lex` method is an asynchronous operation that breaks raw SomMark source code into a list of **Tokens**. This is the first step of the transpilation pipeline.

---

## 1. Standalone Function (Direct Import)

This is a quick way to tokenize a string. It accepts an optional **filename** to provide better context for line and character ranges.

### Signature: `lex(src, filename = "anonymous")`

```js
import { lex } from "sommark";

const tokens = await lex("[h1]Hello World[end]", "main.sm");

console.log(tokens[0]); // { type: 'OPEN_BLOCK', value: '[', ... }
```

---

## 2. Instance Method (Class Member)

When using a `SomMark` instance, the method inherits the source and filename from the constructor.

### Signature: `sm.lex(src = this.src)`

```js
import SomMark from "sommark";

const sm = new SomMark({ 
    src: "[h1]Hello[end]",
    filename: "header.smark"
});

// Uses the 'src' and 'filename' provided to the constructor
const tokens = await sm.lex();
```

---

## 3. Token Structure

Each token contains the following properties:

*   **`type`**: The token identifier (see [TOKEN_TYPES](TOKEN_TYPES.md)).
*   **`value`**: The raw text or symbol captured from the source.
*   **`depth`**: The indentation level of the token.
*   **`range`**: An object containing the `start` and `end` (line and character) of the token in the original file.

---

## 4. Usage Note

The asynchronous `lex` method creates a temporary `SomMark` instance internally to ensure consistent behavior with the rest of the engine. If you need a faster, non-async way to get tokens and don't need engine-level consistency, use [lexSync](lexSync.md).
