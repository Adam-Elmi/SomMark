# renderCompiledHTML()

Injects compiled HTML into a DOM container and activates any `<script>` tags inside it.

---

**Syntax:**
```js
renderCompiledHTML(container, html)
```

**Usage:**
```js
import SomMark, { resolveBaseDir, renderCompiledHTML } from "sommark/browser";

const src = await fetch("./main.smark").then(r => r.text());

const engine = new SomMark({
    src,
    format: "html",
    baseDir: resolveBaseDir("./templates/")
});

const html = await engine.transpile();

renderCompiledHTML(document.getElementById("output"), html);
```

---

### Why It's Needed

Setting `element.innerHTML = html` does **not** execute `<script>` tags inside the injected HTML. This is an intentional browser security restriction — scripts parsed via `innerHTML` are inert and never run.

SomMark's `runtime ${ }$` blocks compile to `<script>` tags. If you use `innerHTML` directly, those blocks are rendered into the DOM but never execute. `renderCompiledHTML` works around this by replacing each inert `<script>` node with a freshly created live `<script>` element, which the browser executes normally.

---

### Example: Runtime Blocks That Mutate the DOM

```html
<div id="output"></div>
```

```ini
[div = class: "card"]
    [h2]Runtime Logic[end:h2]
    [div]
        runtime ${
            self.textContent = "Injected by runtime block";
        }$
    [end:div]
[end:div]
```

```js
import SomMark, { renderCompiledHTML } from "sommark/browser";

const engine = new SomMark({ src, format: "html" });
const html = await engine.transpile();

// ✓ Correct — scripts execute, runtime blocks fire
renderCompiledHTML(document.getElementById("output"), html);

// ✗ Wrong — scripts never run
document.getElementById("output").innerHTML = html;
```

---

### Errors

`renderCompiledHTML` throws a descriptive error in three cases:

**1. Called outside a browser environment:**
```js
// In Node.js
renderCompiledHTML(container, html);
// Throws: [SomMark] renderCompiledHTML() can only be called in a browser environment.
```

**2. Non-HTMLElement container:**
```js
renderCompiledHTML("#output", html);
// Throws TypeError: [SomMark] renderCompiledHTML() expects an HTMLElement as the first argument...
```

**3. Non-string HTML:**
```js
renderCompiledHTML(container, null);
// Throws TypeError: [SomMark] renderCompiledHTML() expects a string as the second argument...
```

---

[Read resolveBaseDir.md for setting up the browser base URL](resolveBaseDir.md)

[Read baseDir.md for the baseDir option details](../Core/baseDir.md)
