# smartAttributes()

Applies block props to a tag as HTML attributes, with a built-in fallback strategy for props that are not standard HTML attributes.

---

**Syntax:**
```js
tag.smartAttributes(args, customProps, options)
```

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `args` | `Object` | The props passed to the block (e.g. `{ class: "card", color: "red" }`). |
| `customProps` | `Set<string>` | Optional. A set of extra prop names to treat as standard HTML attributes instead of falling back. Comes from the `customProps` option. |
| `options` | `Object` | Optional. Accepts `fallbackTarget: "style" \| "class" \| false`. Default is `"style"`. |

---

## How It Works

When a block is compiled, its props are processed by `smartAttributes`. Each prop is checked against a list of known HTML attributes (`HTML_PROPS`). The outcome depends on what kind of prop it is:

| Prop type | Example | Output |
| :--- | :--- | :--- |
| Known HTML attribute | `id: "main"` | `id="main"` |
| Event handler | `onClick: "..."` | `onclick="..."` |
| `data-*` or `aria-*` | `data-theme: "dark"` | `data-theme="dark"` |
| `width` / `height` on media elements | `width: "100"` on `<img>` | `width="100"` |
| Whitelisted via `customProps` | `fill: "red"` (if whitelisted) | `fill="red"` |
| Anything else | `color: "red"` | `style="color:red;"` ← fallback |

The fallback is what makes it convenient to write CSS shorthand directly on a block:

```ini
[span = color: "red", font-size: "14px"] Hello [end]
```
```html
<span style="color:red;font-size:14px;">Hello</span>
```

---

## Fallback Strategies

The `fallbackTarget` option controls where unrecognised props end up:

```js
// Default — falls back to style (same as not passing options at all)
tag.smartAttributes(args, customProps, { fallbackTarget: "style" });
// Output: <div style="color:red;">

// Falls back to a CSS class name
tag.smartAttributes(args, customProps, { fallbackTarget: "class" });
// Output: <div class="color-red">

// No fallback — unrecognised props are still rendered as attributes
tag.smartAttributes(args, customProps, { fallbackTarget: false });
// Output: <div color="red">
```

See [fallbackTarget.md](../Core/fallbackTarget.md) for full details.

---

## SVG Elements

SVG attributes like `fill`, `d`, `viewBox`, and `clip-path` are not in the HTML attribute list, so `smartAttributes` would convert them to inline styles, producing broken SVG output like `style="fill:red;d:...;"`.

To prevent this, the HTML mapper skips `smartAttributes` entirely for SVG elements and uses `attributes()` directly instead. SVG elements are identified via `constants/svg_elements.js`.

If you are writing a custom mapper that handles SVG, use `attributes()` instead of `smartAttributes()` for SVG elements:

```js
import { SVG_ELEMENTS } from "sommark/constants/svg_elements.js";

mapper.register("mySvgWrapper", function({ args, content }) {
    const tag = this.tag("svg");
    if (SVG_ELEMENTS.has("svg")) {
        tag.attributes(args);   // plain attribute output — no fallback
    } else {
        tag.smartAttributes(args, this.customProps, this.options);
    }
    return tag.body(content);
});
```

---

## Whitelisting Custom Props

If you have a custom attribute that is not a standard HTML attribute but should still render as an attribute (not a style), add it to the `customProps` option:

```js
import { transpile } from "sommark";

const output = await transpile({
    src: '[div = theme: "dark"] Content [end]',
    format: "html",
    customProps: ["theme"]
});
// Output: <div theme="dark">Content</div>
```

Without `customProps: ["theme"]`, the output would be `<div style="theme:dark;">Content</div>`.

See [customProps.md](../Core/customProps.md) for full details.

---

## Related

- [tag()](./tag.md) — creates the TagBuilder instance that `smartAttributes` is called on.
- [customProps](../Core/customProps.md) — whitelist attributes to skip the fallback.
- [fallbackTarget](../Core/fallbackTarget.md) — control where unrecognised props fall back to.
