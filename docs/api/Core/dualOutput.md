# dualOutput

Instructs the transpiler to return both the HTML output and the JS bundle in a single compilation. The result is a two-element array `[html, js]`.

---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format, dualOutput })

// 2. In transpile function
transpile({ src, format, dualOutput })
```

**Default Value:** `false`

**Return type when true:** `Promise<[string, string]>` — `[html, js]`

---

**Usage:**
```js
import SomMark from "sommark";

const [html, js] = await new SomMark({
  src: `[button]
  Click me
  runtime \${ self.onclick = () => alert("clicked!"); }\$
[end]`,
  format: "html",
  dualOutput: true
}).transpile();

console.log(html);
// <button data-sommark-id="sommark-button-af9cfd76">
//   Click me
// </button>

console.log(js);
// (async function(){const self = document.querySelector('[data-sommark-id="sommark-button-af9cfd76"]');
// if (self) {
//   self.onclick = () => alert("clicked!");
// }
// })();
```

---

### Why `dualOutput` exists

Each compilation generates a fresh random `data-sommark-id` for every element that contains a `runtime ${ }$` block. If you compile HTML and JS in two separate calls, each call produces a different ID — the JS `querySelector` will look for an element that does not exist in the HTML.

```js
// ✗ Wrong — two compilations, two different IDs
const html = await transpile({ src, format: "html", hideRuntimeOutput: true });
// → data-sommark-id="sommark-div-aabbccdd"

const js = await transpile({ src, format: "html", generateRuntimeOutput: true });
// → querySelector('[data-sommark-id="sommark-div-11223344"]')  ← different ID, never matches
```

`dualOutput: true` solves this by running both the HTML pass and the JS pass inside one `transpile()` call. The IDs are generated once and shared between both outputs.

```js
// ✓ Correct — one compilation, matching IDs
const [html, js] = await new SomMark({ src, format: "html", dualOutput: true }).transpile();
// html → data-sommark-id="sommark-div-aabbccdd"
// js   → querySelector('[data-sommark-id="sommark-div-aabbccdd"]')  ← same ID, always matches
```

---

### With `generateRuntimeOutput` or `hideRuntimeOutput`

When `dualOutput: true` is set, `generateRuntimeOutput` and `hideRuntimeOutput` are ignored — `dualOutput` manages both passes internally. SomMark logs a warning if those flags are also present:

```js
const result = await new SomMark({
  src,
  format: "html",
  dualOutput: true,
  generateRuntimeOutput: true  // ← ignored, warning is logged
}).transpile();

// [SomMark] ⚠ Ignored options when dualOutput is true
//   `generateRuntimeOutput` is ignored when dualOutput: true is set.
//   dualOutput manages both HTML and JS passes internally — no need to set those flags.
```

The result is still `[html, js]` as expected.

---

### When JS output is empty

If the source has no `runtime ${ }$` blocks, `js` will be an empty string. You can check before using it:

```js
const [html, js] = await new SomMark({ src, format: "html", dualOutput: true }).transpile();

if (js) {
  // inject or bundle the JS
}
```

---

[Read generateRuntimeOutput.md for compiling JS only](generateRuntimeOutput.md)

[Read hideRuntimeOutput.md for stripping scripts from HTML output](hideRuntimeOutput.md)

[Read transpile.md for compilation pipelines](transpile.md)
