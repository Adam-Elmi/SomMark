# customProps

The `customProps` property is a **Set** that whitelists custom attributes. It tells SomMark that specific properties should be rendered as **standard HTML attributes** instead of being converted into inline CSS styles by the automatic styling fallback system.

---

## 1. Why it is useful: The Styling Fallback System

By default, SomMark's `smartAttributes()` method protects your HTML by moving non-standard attributes into the `style` attribute so your browser doesn't render invalid HTML properties.

### Without customProps (Auto-Style Fallback)
If you pass a custom property like `theme` to a block:
* **Smark Input**: `[div = theme: "dark"]Content[end:div]`
* **Generated HTML**: `<div style="theme:dark;">Content</div>` (This is invalid CSS!)

---

## 2. The Solution: Whitelisting

By adding `"theme"` to `customProps`, you tell the engine that it is a valid custom property. SomMark will then keep it as a native attribute.

### How to whitelist a property
```js
import { HTML } from "sommark";

// Whitelist the custom 'theme' and 'columns' properties
HTML.customProps.add("theme");
HTML.customProps.add("columns");
```

### Result:
* **Smark Input**: `[div = theme: "dark", columns: 3]Content[end:div]`
* **Generated HTML**: `<div theme="dark" columns="3">Content</div>` (Perfect, clean HTML!)

---

## 3. How to use in Mappers

To make this work, pass `this.customProps` into `smartAttributes(props, customProps)` inside your mapper functions:

```js
mapper.register("Card", function({ props, content }) {
    return this.tag("div")
        .smartAttributes(props, this.customProps)
        .body(content);
});
```

---

## 4. Key Rules

1. **Automatic Kebab-Case Matching**: If you whitelist a property in camelCase (e.g. `cardTitle`), SomMark will automatically match its kebab-case version (`card-title`) too.
2. **Ignored for Special Elements**: `smartAttributes()` will never apply styling fallbacks to `<style>` or `<script>` elements, keeping their attributes native automatically.

---

[Read tag() for more info](tag.md)

[Read register() for more info](register.md)