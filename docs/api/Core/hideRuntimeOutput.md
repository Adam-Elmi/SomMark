# hideRuntimeOutput

Instructs the transpiler to suppress all runtime JS from the HTML output. Elements that contain `runtime ${ }$` blocks still receive their `data-sommark-id` attribute, but the script itself is not included in the output.

---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format, hideRuntimeOutput })

// 2. In transpile function
transpile({ src, format, hideRuntimeOutput })
```

**Default Value:** `false`

---

**Usage:**
```js
import { transpile } from "sommark";

const html = await transpile({
  src: `[div]
  [h1]Title[end]
  runtime \${ console.log(self); }\$
[end]`,
  format: "html",
  hideRuntimeOutput: true
});

console.log(html);
// Output:
// <div data-sommark-id="sommark-div-1f2a3d4e"><h1>Title</h1></div>
```

The `data-sommark-id` attribute is still written to the element — it is only the script block that is omitted.

---

### Getting both HTML and JS with matching IDs

Each compilation generates new random IDs. If you compile HTML and JS in two separate calls, the IDs will be different and the JS `querySelector` will never find the element. Use `dualOutput: true` to get both outputs from one compilation with guaranteed matching IDs:

```js
import SomMark from "sommark";

const [html, js] = await new SomMark({
  src: `[div]Content[end]
runtime \${ alert(self); }\$`,
  format: "html",
  dualOutput: true
}).transpile();

console.log(html);
// <div data-sommark-id="sommark-div-e5f6a7b8">Content</div>

console.log(js);
/*
(async function(){const self = document.querySelector('[data-sommark-id="sommark-div-e5f6a7b8"]');
if (self) {
  alert(self);
}
})();
*/
```

`dualOutput` returns `[html, js]` — an array of two strings. Both share the same IDs because they come from one internal traversal.

---

### Conflict: `hideRuntimeOutput` and `generateRuntimeOutput` both true

Setting both flags at the same time produces an empty string — they cancel each other out. `hideRuntimeOutput: true` suppresses JS, and `generateRuntimeOutput: true` suppresses HTML, so nothing is left. SomMark logs a warning when this happens:

```js
const result = await transpile({
  src,
  format: "html",
  hideRuntimeOutput: true,
  generateRuntimeOutput: true
});
// [SomMark] ⚠ Conflicting options — output will be empty
// result === ""
```

---

[Read dualOutput.md for getting both outputs in one call](dualOutput.md)

[Read generateRuntimeOutput.md for compiling JS bundles](generateRuntimeOutput.md)

[Read transpile.md for compilation pipelines](transpile.md)
