# outputValidator

A custom validation callback executed automatically at the end of the compilation pipeline, just before the final output is returned.

---

**Syntax:**
```js
const compiler = new SomMark({
  outputValidator: (output) => {
    // Custom validation logic here
  }
});
```

---

## Key Behaviors

* **Execution Point**: Runs at the very end of `compiler.transpile()`, receiving the complete, final compiled string as its sole parameter.
* **Async-Ready**: Supports standard synchronous or asynchronous (`async/await`) execution.
* **Stop on Exception**: If the validation function throws an error, the compilation pipeline immediately stops, bubbling up the error to prevent saving or displaying invalid code.

---

## Examples

### 1. HTML Layout Integrity
Ensure that compiled HTML outputs never exceed tag safety or contain invalid fragments:

```js
import { transpile } from "sommark";

await transpile({
  src: "[div]Hello World[end]",
  format: "html",
  outputValidator: (html) => {
    if (!html.startsWith("<div>") || !html.endsWith("</div>")) {
      throw new Error("Validation Error: HTML output must be wrapped inside a container element.");
    }
  }
});
```

### 2. JSON Validation (Strict Parse Check)
Ensure that structured mappers (such as `json` or `jsonc`) always produce syntactically valid JSON before saving:

```js
import { transpile } from "sommark";

await transpile({
  src: "[string = key: 'name', value: 'Adam' !]",
  format: "json",
  outputValidator: (json) => {
    try {
      JSON.parse(json);
    } catch (err) {
      throw new Error("Validation Error: Compiled output is not a valid JSON structure.");
    }
  }
});
```

---

[Read transpile.md to understand the compilation pipeline](transpile.md)
[Read security.md for sandbox and compilation restrictions](security.md)
