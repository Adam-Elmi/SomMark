# customProps

The `customProps` property is a **Set** that acts as a whitelist for non-standard attributes. It tells the SomMark engine that specific properties should be treated as **native HTML attributes** rather than being moved to the `style` attribute by the styling fallback system.

**Syntax:** `mapper.customProps` (Set)

---

## 1. The Real-World Problem

By default, any attribute that isn't a standard HTML property (like `id` or `class`) or a data/aria attribute is automatically converted into a CSS style by `smartAttributes()`.

**Example WITHOUT customProps:**
*   **Smark**: `[div = theme: "dark"] Content [end]`
*   **Output**: `<div style="theme:dark;">Content</div>` (Invalid CSS)

---

## 2. The Solution: Whitelisting

By adding `"theme"` to `customProps`, you force the engine to keep it as a standard attribute. This is essential when building custom components or using libraries that rely on non-standard attributes.

**Example WITH customProps:**
```js
import { HTML } from "sommark";

// Whitelist the custom 'theme' property
HTML.customProps.add("theme");
```

**Result Interaction:**
*   **Smark**: `[div = theme: "dark"] Content [end]`
*   **Output**: `<div theme="dark">Content</div>` (Proper HTML attribute)

---

## 3. Usage in Mappers

When using `this.tag().smartAttributes(args)`, the mapper automatically passes its `customProps` set to the builder.

```js
mapper.register("MyComponent", function({ args, content }) {
    // This will check mapper.customProps to decide where to put args
    return this.tag("div")
        .smartAttributes(args, this.customProps)
        .body(content);
});
```

---