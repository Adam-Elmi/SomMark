# HTML Mapping Guide

SomMark is a powerful HTML5 transpilation engine. It converts your structural blocks into accurate, type-safe HTML with automatic styling optimizations, semantic validation, and built-in security.

---

## 1. Native HTML Support 

You can use **any standard HTML5 tag** in SomMark without registration. If a tag is not explicitly registered in the mapper, SomMark automatically treats it as a standard HTML element.

**Example: Using Unregistered Tags**
```ini
[section = padding: "20px"]
  [article]
    [header] [h1]Article Title[end] [end]
    [p]This is a standard HTML5 article structure.[end]
  [end]
[end]
```

---

## 2. Smart Attribute Engine

The HTML Mapper uses a comprehensive **Smart Attribute** system that decides how every argument in your SomMark header should be rendered.

### The "Style Fallback" Rule
If you pass an argument that is not a standard HTML property (like `id`, `class`, or `href`), SomMark automatically moves it into the `style` attribute.

**Authoring Flexibility**: You can use **camelCase** (e.g., `backgroundColor`, `dataId`, `onClick`) throughout your document. SomMark automatically normalizes **all attributes** to their standard kebab-case or lowercase counterparts (e.g., `background-color`, `data-id`, `onclick`).

**Important: Style Merging**
If you provide a manual `style` prop AND unknown properties, SomMark **merges** them together seamlessly.
```ini
[div = style: "opacity: 0.5", color: "red", margin: "10px"] ... [end]
```
**Resulting HTML:**
```html
<div style="opacity: 0.5;color:red;margin:10px;"> ... </div>
```

**Advanced Style Merging Example:**
```ini
[button = 
  style: "transition: 0.3s", 
  backgroundColor: "green", 
  color: "white", 
  border: "none", 
  padding: "10px 20px"
] Click Me [end]
```
**Result:** `<button style="transition: 0.3s;background-color:green;color:white;border:none;padding:10px 20px;">Click Me</button>`

### Custom Properties (`customProps`)
You can whitelist non-standard attributes (like framework-specific props or custom system flags) to ensure they are rendered as literal HTML attributes instead of being moved to the `style` fallback. 

> [!NOTE]
> Standard HTML5 attributes including **`data-*`**, **`on*`**, and **`aria-*`** are natively supported and do not need to be whitelisted.

**Developer Setup (`index.js`):**
```javascript
const sm = new SomMark({
    src: source,
    format: "html",
    customProps: ["variant", "theme"] // Whitelist these
});
```

**Result in SomMark:**
```ini
# This stays as an attribute because it is whitelisted
[button = variant: "primary", theme: "dark", data-id: "123"] Click [end]
```
**Output:** `<button variant="primary" theme="dark" data-id="123">Click</button>`

**without customProps:**
`<button style="variant: primary; theme: dark;" data-id="123">Click</button>`

---

## 3. Shared Utility Outputs

The HTML mapper includes several shared utility tags that provide foundational functionality.

### The `css` Inline
The `css` tag allows you to apply inline styles to specific spans of text using positional arguments.
*   **Syntax**: `(content)->(css: "style string")`
*   **Output**: `<span style="...">content</span>`

**Example:**
```ini
Success is (guaranteed)->(css: "color: green; font-weight: bold") if you plan.
```

### The `raw` At-Block
Use the `raw` block to inject literal HTML that skips both the parser and the safety escaping layer.
*   **Syntax**: `@_raw_@; <iframe>...</iframe> @_end_@`

**Example: Embedding a Video**
```ini
@_raw_@;
  <iframe width="560" height="315" src="https://www.youtube.com/embed/..." frameborder="0"></iframe>
@_end_@
```

---

## 4. Validation

SomMark uses the `validator.js` engine to enforce semantic rules during the transpilation stage.

### Self-Closing (Void) Elements
Standard HTML void elements (like `img`, `br`, `hr`, `meta`, and `link`) are automatically detected and strictly enforced as **Block** types.

1.  **Rendering**: They are rendered as self-closing tags (`<img />`).
2.  **Strict Enforcement**: The validator **forbids** these tags from having an internal body. Adding content inside an `[img]` block will trigger a **Validation Error**.

```r
# VALID: Empty body
[img = src: "photo.jpg"][end]

# INVALID: Triggers Validation Error
[img = src: "photo.jpg"]This is not allowed![end]
```

---

## 5. Global CSS Variables & Head Injection

The HTML mapper supports a **Collector Pattern** for managing globally scoped CSS variables.

1.  **Collect**: Use the `[Root]` block to define properties starting with `--`.
2.  **Inject**: Use the `[head]` block. The mapper will automatically inject a `:root` style tag containing all collected variables.

**Example: Theming a Page**
```ini
[Root = 
  --bg-color: "#f0f0f0", 
  --main-text: "#333", 
  --accent: "orange"
][end]

[head]
  [title]Themed Page[end]
[end]

[body = backgroundColor: --bg-color, color: --main-text]
  [h1 = borderBottom: "2px solid" + --accent] Header [end]
[end]
```
**Output Highlights:**
```html
<head>
  <style>:root { --bg-color:#f0f0f0;--main-text:#333;--accent:orange; }</style>
  <title>Themed Page</title>
</head>
```

---

## 6. Security & Scoping

### Scoped Logic (IIFE)
Adding `scoped: true` to a `@_script_@` block automatically wraps your JavaScript in an IIFE to prevent global scope contamination.
```ini
@_script_@: scoped: true;
  const privateVar = 10;
@_end_@
```

### Context-Aware Escaping (The Escape-Free Trinity)
By default, all content is escaped to prevent XSS. However, the trinity of At-Blocks below explicitly **disables escaping** for their content to preserve code and style integrity while keeping the outer structure safe:

1.  **`@_style_@`**: Injects raw CSS.
2.  **`@_script_@`**: Injects raw JavaScript.
3.  **`@_raw_@`**: Injects raw HTML markup.

---

## 7. Core Advantages Over Raw HTML

While you can write standard HTML5, SomMark provides two major architectural advantages that raw HTML lacks:

1.  **Built-in Module System**: SomMark supports native imports (`[import]`) and component usage (`[$use-module]`). This allows you to split your UI into reusable parts, creating a true component library without needing a heavy JavaScript framework.
2.  **Direct Styling Engine**: You can use CSS properties (like `color`, `fontSize`, or `padding` or any other CSS property) as **global attributes** directly in the block header. SomMark merges these into the `style` property automatically, making it much cleaner and faster to write than a standard HTML `style="..."` string.
