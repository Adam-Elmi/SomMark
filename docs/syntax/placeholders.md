# The Placeholder Layer `p{}`

`p{}` injects global values from your JavaScript configuration into any template. Unlike local variables (`v{}`), placeholders are resolved from a shared object that passes through the entire compilation graph automatically.

---

## 1. Syntax

```ini
p{key}
p{key | "fallback"}
```

| Part | Required | Description |
| :--- | :--- | :--- |
| `key` | Yes | The placeholder key to look up. Must start with a letter, `_`, or `$`. |
| `\| "fallback"` | No | A quoted string to use if the key is not found. |

---

## 2. Where You Can Use It

`p{}` works anywhere in a template — in body text, in block props, and inside quoted strings.

**In body text:**
```ini
[p]Welcome to p{siteName}![end:p]
```

**In block props:**
```ini
[img = src: p{cdnUrl}/logo.png, alt: "Logo" !]
```

**Inside a quoted string:**
```ini
[a = href: "p{baseUrl}/contact"]Contact[end:a]
```

---

## 3. Providing Placeholders

Pass a `placeholders` object when compiling:

```javascript
import { transpile } from "sommark";

const output = await transpile({
  src: "[h1]Welcome to p{siteName}![end:h1]",
  format: "html",
  placeholders: {
    siteName: "SomMark Docs"
  }
});
```

**Output:**
```html
<h1>Welcome to SomMark Docs!</h1>
```

---

## 4. Fallback Values

If a key might not always be provided, add a fallback after `|`:

```ini
[footer]Built with p{engine | "SomMark"}[end:footer]
```

- If `engine` is set → uses its value.
- If `engine` is not set → renders `SomMark`.

The fallback **must be a quoted string**.

---

## 5. Unresolved Placeholders

If a key is not found and no fallback is given, SomMark renders a high-visibility envelope in the output:

```
SOMMARK_UNRESOLVED_p_key_SOMMARK
```

This is intentional — it makes missing placeholders immediately visible so you can find and fix them.

---

## 6. Propagation into Sub-Components

Placeholders pass down automatically to every imported `.smark` component. You never need to thread them through manually.

**`Card.smark`**
```ini
[div = class: "card"]
  [p]Powered by p{brandName}[end:p]
[end:div]
```

**`index.smark`**
```ini
[import = Card: "./Card.smark" !]

[Card !]
```

**JavaScript:**
```javascript
const output = await transpile({
  src: await fs.readFile("./index.smark", "utf-8"),
  format: "html",
  placeholders: { brandName: "SomMark Engine" }
});
```

**Output:**
```html
<div class="card">
  <p>Powered by SomMark Engine</p>
</div>
```

---

## 7. `p{}` vs `v{}`

| | `p{}` | `v{}` |
| :--- | :--- | :--- |
| **Source** | `placeholders` option in JS config | Props passed to a component |
| **Scope** | Global — available everywhere | Local — scoped to one component call |
| **Propagation** | Automatic — passes to all sub-components | Only the component that receives the prop |
| **Fallback syntax** | `p{key \| "default"}` | `v{key \| "default"}` |
| **Positional access** | Not supported | `v{0}`, `v{1}`, ... |
