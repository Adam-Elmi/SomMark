# lexSync

`lexSync` is the ultra-fast, synchronous version of the lexer. It breaks raw SomMark source code into a list of **Tokens** immediately.

---

## 1. Usage (Standalone Only)

Unlike `parse` or `lex`, the `lexSync` method is **only available as a standalone function**. It is designed for simplicity and speed.

### Signature: `lexSync(src)`

```js
import { lexSync } from "sommark";

// Synchronous and immediate
const tokens = lexSync("[h1]Hello World[end]");

console.log(tokens[0].type); // OPEN_BLOCK
```

---

## 2. Key Differences

| Feature | `lex` (Async) | `lexSync` (Sync) |
| :--- | :--- | :--- |
| **Availability** | Instance & Standalone | **Standalone Only** |
| **Arguments** | `(src, filename)` | **`(src)` only** |
| **Return Value** | `Promise<Array>` | `Array` |
| **Use Case** | Complex documents | Simple strings / Highlighters |

---

## 3. When to use `lexSync`?

*   **Syntax Highlighting**: Perfect for editors that need real-time tokens without waiting for the event loop.
*   **Simple Analysis**: If you just need to check if a string contains certain tags without running the full engine.
*   **No Instance Needed**: Since it doesn't require a `SomMark` instance, it's very lightweight.
