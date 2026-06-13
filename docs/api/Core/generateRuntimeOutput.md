# generateRuntimeOutput

Instructs the transpiler to output only the runtime JS bundle. All static HTML is suppressed and only `runtime ${ }$` blocks are emitted.

---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format, generateRuntimeOutput })

// 2. In transpile function
transpile({ src, format, generateRuntimeOutput })
```

**Default Value:** `false`

---

**Usage:**
```js
import { transpile } from "sommark";

const js = await transpile({
  src: `[div]Text[end]
runtime \${ console.log("running"); }\$`,
  format: "html",
  generateRuntimeOutput: true
});

console.log(js);
// Output:
// console.log("running");
```

---

### Scope-Wrapped Block Scripts

When a `runtime ${ }$` block is placed inside a mapped element, the transpiler wraps the script in an async IIFE scoped to that element. The element is found at runtime using a unique `data-sommark-id` attribute:

```js
import { transpile } from "sommark";

const js = await transpile({
  src: `[div]
  [p]Scoped element[end]
  runtime \${ self.textContent = "hello"; }\$
[end]`,
  format: "html",
  generateRuntimeOutput: true
});

console.log(js);
/*
(async function(){const self = document.querySelector('[data-sommark-id="sommark-div-8a7f92b3"]');
if (self) {
  self.textContent = "hello";
}
})();
*/
```

The `data-sommark-id` value is randomly generated at compile time. This means **two separate compilations of the same source will produce different IDs** — the HTML and JS will not match. To get both outputs with guaranteed matching IDs, use `dualOutput: true` instead:

```js
const [html, js] = await new SomMark({
  src,
  format: "html",
  dualOutput: true
}).transpile();
```

---

### Conflict: `generateRuntimeOutput` and `hideRuntimeOutput` both true

Setting both flags at the same time produces an empty string — they cancel each other out. `generateRuntimeOutput: true` suppresses HTML, and `hideRuntimeOutput: true` suppresses JS, so nothing is left. SomMark logs a warning when this happens:

```js
const result = await transpile({
  src,
  format: "html",
  generateRuntimeOutput: true,
  hideRuntimeOutput: true
});
// [SomMark] ⚠ Conflicting options — output will be empty
// result === ""
```

---

[Read dualOutput.md for getting both outputs in one call](dualOutput.md)

[Read hideRuntimeOutput.md for stripping scripts from HTML output](hideRuntimeOutput.md)

[Read transpile.md for compilation pipelines](transpile.md)
