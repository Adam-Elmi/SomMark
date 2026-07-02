# raw()

Marks a value to bypass the transpiler's output escaping stage.

---

**Syntax:**
```js
SomMark.raw(value);
```

**Usage:**
```javascript
static ${
  return SomMark.raw("<p>Hello</p>");
}$
```

---

### How Static Block Output Works

Understanding `SomMark.raw` requires understanding the two-stage pipeline for static block output:

**Stage 1 — Sandbox execution:** The static block code runs inside the QuickJS sandbox. When the block returns a value, that value is handed back to the transpiler on the host side.

**Stage 2 — Transpiler escaping:** The transpiler takes the returned string and passes it through `mapper.text()` before appending it to the output. This is where format-specific escaping is applied — HTML entities for the HTML format (`<` → `&lt;`, `>` → `&gt;`, etc.), equivalent rules for other formats.

`SomMark.raw(value)` works by returning an object `{ __raw: value }` instead of a plain string. When the transpiler sees this object, it skips `mapper.text()` and writes the value directly to the output — bypassing escaping entirely.

```
static block returns string   →  transpiler calls mapper.text()  →  escaped output
static block returns raw(v)   →  transpiler skips mapper.text()  →  unescaped output
```

---

### Example: Escaped vs Raw Output

```js
// Without SomMark.raw — mapper.text() is applied, entities are escaped
static ${ return "<h1>Welcome</h1>"; }$
// Output: &lt;h1&gt;Welcome&lt;/h1&gt;

// With SomMark.raw — mapper.text() is skipped, value written as-is
static ${ return SomMark.raw("<h1>Welcome</h1>"); }$
// Output: <h1>Welcome</h1>
```

---

### Primary Use Case: Injecting Compiled Sub-Template Output

The main reason `SomMark.raw` exists is to inject the output of `SomMark.compile()`. Compiled output is already valid HTML (or whatever target format) — escaping it again would corrupt it:

```js
static ${
  const card = "[div = class: 'card']Adam[end:div]";
  const output = await SomMark.compile(card, { format: "html" });
  // output = '<div class="card">Adam</div>'

  // Without raw: the HTML gets double-escaped → &lt;div...
  // With raw: written directly → <div class="card">Adam</div>
  return SomMark.raw(output);
}$
```

---

### Security Interaction

`SomMark.raw` respects the `security` configuration of the parent compilation:

**`security.allowRaw: false`** — disables raw entirely. The object `{ __raw: value }` is ignored and `mapper.text()` is forced, so all output is escaped regardless of `SomMark.raw`:

```js
static ${ SomMark.raw("<div>Blocked</div>") }$
// With security: { allowRaw: false }
// Throws: Security Error: SomMark.raw is disabled in this environment.
```

**`security.sanitize`** — when `allowRaw` is enabled and a sanitizer function is provided, raw output passes through the sanitizer before being written. This lets you strip dangerous tags while still allowing trusted markup:

```js
const output = await transpile({
  src: 'static ${ SomMark.raw("<p>Hello <script>alert(1)</script></p>") }$',
  format: "html",
  security: {
    sanitize: (html) => html.replace(/<script[\s\S]*?<\/script>/gi, "")
  }
});
// Output: <p>Hello </p>
```

---

[Read compile.md for recursive template generation](compile.md)

[Read security.md for allowRaw and sanitize configuration](../Core/security.md)

[Read static.md for how static blocks execute](static.md)
