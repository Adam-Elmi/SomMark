# customProps

An array of whitelisted custom attribute names that should be rendered as standard HTML/XML attributes.
---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format, customProps })

// 2. In transpile options
transpile({ src, format, customProps })
```

**Usage:**
```js
import { transpile } from "sommark";

const output = await transpile({
  src: '[button theme: "dark" columns: 4]Click[end]',
  format: "html",
  customProps: ["theme", "columns"]
});
console.log(output);
// Output: <button theme="dark" columns="4">Click</button>
```

---

## 1. The Real-World Problem

Built-in mappers (like HTML and Markdown) use the `smartAttributes` method. This lets developers use CSS properties as global parameters directly on blocks:
*   Instead of writing: `[span = style: "color:red;"]Hello[end]`
*   You can write: `[span = color: "red"]Hello[end]`

Because of this, any attribute that is **not** a standard native HTML property (like `id` or `class`) or a data/aria property is automatically converted into an inline CSS style or a CSS class (depending on the `fallbackTarget` setting).

This causes issues when you want to pass actual custom properties (e.g. for custom elements or web components).

### Example WITHOUT customProps:
*   **SomMark**: `[div = theme: "dark"]Content[end]`
*   **Compiled Output**: `<div style="theme:dark;">Content</div>` (Invalid CSS)

---

## 2. The Solution: Whitelisting with customProps

By adding `"theme"` to the `customProps` array, you explicitly whitelist it. The engine will then render it as a standard attribute instead of falling back:

```javascript
import { transpile } from "sommark";

const output = await transpile({
  src: '[div = theme: "dark"]Content[end]',
  format: "html",
  customProps: ["theme"]
});
console.log(output);
// Output: <div theme="dark">Content</div>
```

[Read fallbackTarget.md for styling fallbacks](fallbackTarget.md)

[Read transpile.md for compilation details](transpile.md)
