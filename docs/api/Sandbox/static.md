# static()

Executes a JavaScript expression at compile time from inside a `runtime ${ }$` or `static ${ }$`  block, baking the result in as a literal value.

---

**Syntax:**
```js
SomMark.static(expression);
```

**Usage:**
```javascript
runtime ${
  const version = SomMark.static(`SomMark.version`);
  console.log("Compiler version:", version);
}$
```

---

### Why It Exists

`runtime ${ }$` blocks become `<script>` tags — they run in the browser, not at compile time. This means any code inside them has no access to the compile-time environment: no `SomMark.version`, no `SomMark.settings`, no `SomMark.fetch`, no `SomMark.compile`, nothing.

`SomMark.static()` is the bridge. It lets you reach into the compile-time sandbox from inside a runtime block. The expression string is executed at compile time (inside QuickJS), and the result is serialized and spliced back into the script as a literal value — before the `<script>` tag is ever written.

```js
runtime ${
  const v = SomMark.static("SomMark.version");
}$
// ↓ preprocessor evaluates `SomMark.version` at compile time → "4.2.0"

// output:
<script>
  const v = "4.2.0";
</script>
```

In a `static ${ }$` block, you already have full compile-time access — you can call `SomMark.version`, `SomMark.fetch`, etc. directly. `SomMark.static()` works there too, but it adds no benefit over calling the API directly.

---

### Available APIs Inside the Expression

The expression string runs in the same QuickJS sandbox as a `static ${ }$` block, so all compile-time APIs are available:

- `SomMark.version` — compiler version string
- `SomMark.settings` — active compilation settings
- `SomMark.fetch(url)` — secure sandboxed HTTP request
- `SomMark.compile(src, options)` — recursive sub-template compilation
- `SomMark.import(path)` — local file import

---

### Example: Baking Compile-Time Settings Into a Client Script

```js
runtime ${
  const isHtmlTarget = SomMark.static(`SomMark.settings.format === "html"`);

  if (isHtmlTarget) {
    document.body.classList.add("html-layout");
  }
}$
```

Emitted `<script>`:
```html
<script>
  const isHtmlTarget = true;

  if (isHtmlTarget) {
    document.body.classList.add("html-layout");
  }
</script>
```

The `if` check is fully runtime JS — but the value it checks against was resolved at compile time and is now a plain `true` literal in the output.

---

### Example: Fetching Data at Compile Time for Use at Runtime

Fetch an API at compile time and bake the result into the client script so the browser never needs to make the request:

```js
runtime ${
  const config = SomMark.static(`
    const res = await SomMark.fetch("https://api.example.com/config");
    return await res.json();
  `);

  applyConfig(config);
}$
```

Emitted `<script>`:
```html
<script>
  const config = {"theme":"dark","lang":"en"};

  applyConfig(config);
</script>
```

---

> [!TIP]
> Use backticks instead of quotes for the expression argument — the LSP treats the content as an embedded JS template literal and provides syntax highlighting, autocompletion, and error detection inside the string:
> ```js
> // ✓ LSP highlights JS inside
> SomMark.static(`SomMark.settings.format === "html"`);
>
> // No highlighting
> SomMark.static('SomMark.settings.format === "html"');
> ```

> [!NOTE]
> The expression argument must be a string. The return value is serialized to a JavaScript literal — strings, numbers, booleans, and plain objects/arrays are supported.

---

[Read raw.md for output escaping and bypassing](raw.md)

[Read compile.md for recursive template generation](compile.md)

[Read fetch.md for secure HTTP requests](fetch.md)

[Read settings.md for compile-time settings access](settings.md)

[Read import.md for compile-time local file importing](import.md)
