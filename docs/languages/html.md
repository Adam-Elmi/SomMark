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

### Disabling the Style Fallback (`useStyleFallback`)
If you want to completely disable the "Smart Attribute Engine" and ensure that **all** properties are rendered as standalone HTML attributes (like in MDX), you can use the `useStyleFallback` flag.

**Developer Setup (`index.js`):**
```javascript
const sm = new SomMark({
    src: source,
    format: "html",
    useStyleFallback: false // Disable the fallback
});
```

**Result in SomMark:**
```ini
[button = variant: "primary", theme: "dark"] Click [end]
```
**Output:** `<button variant="primary" theme="dark">Click</button>`

---

### 3. Registered Outputs & Layout Utilities

The HTML mapper explicitly registers several specialized tags that provide foundational structure, global configurations, rich styling, and escaping overrides. Below is the complete, detailed list of these registered outputs with syntax guidelines and examples.

### 1. `[DOCTYPE]` / `[doctype]`
- **Type**: Block
- **Purpose**: Generates the standard HTML5 doctype declaration. This is a self-closing structural tag.
- **Example**:
  ```ini
  [DOCTYPE][end]
  ```
  **Output HTML**:
  ```html
  <!DOCTYPE html>
  ```

### 2. `[head]`
- **Type**: Block (Unescaped)
- **Purpose**: Formats the document's `<head>` tag. It automatically handles CSS Variable injection when variables are collected from the `[Root]` element, wrapping them in a `:root` style block inside the head.
- **Example**:
  ```ini
  [head]
    [title]My Dynamic Page[end]
    [meta = charset: "utf-8"][end]
  [end]
  ```
  **Output HTML**:
  ```html
  <head>
    <style>:root { /* Any collected CSS variables appear here */ }</style>
    <title>My Dynamic Page</title>
    <meta charset="utf-8" />
  </head>
  ```

### 3. `[Root]` / `[root]`
- **Type**: Block
- **Purpose**: A metadata and global CSS variable collector. Any arguments starting with `--` are parsed as CSS variables and stored in the mapper instance. They will be automatically rendered as a `:root` styling block inside the `[head]` tag.
- **Example**:
  ```ini
  [Root = 
    --primary-color: "#007bff",
    --bg-color: "#ffffff"
  ][end]
  ```

### 4. `css` Span Inline
- **Type**: Inline
- **Purpose**: Applies rich inline style rules to a specific span of text. It compiles named arguments (like `color` or `fontSize`) as well as positional style strings.
- **Example**:
  ```ini
  This is a (highly styled text span)->(css: "font-weight: bold", color: "red", fontSize: "16px").
  ```
  **Output HTML**:
  ```html
  This is a <span style="font-weight:bold;color:red;font-size:16px;">highly styled text span</span>.
  ```

### 5. `raw` AtBlock
- **Type**: AtBlock (Unescaped)
- **Purpose**: Bypasses the HTML escaping layer and parser entirely to output raw, unescaped HTML content. Excellent for third-party embeds, iframes, or custom widgets.
- **Example**:
  ```ini
  @_raw_@;
    <div class="custom-widget">Raw Embed</div>
  @_end_@
  ```
  **Output HTML**:
  ```html
  <div class="custom-widget">Raw Embed</div>
  ```

### 6. `[script]` Block / AtBlock
- **Type**: Block or AtBlock (Unescaped)
- **Purpose**: Injects executable JavaScript. It natively supports a `scoped: true` option which automatically wraps the script in an IIFE to isolate it from the global window scope.
- **Example**:
  ```ini
  [script = scoped: true]
    const localVal = "scoped to this script block";
    console.log(localVal);
  [end]
  ```
  **Output HTML**:
  ```html
  <script>(function(){
    const localVal = "scoped to this script block";
    console.log(localVal);
  })();</script>
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
Adding `scoped: true` to a `@_script_@` block or `[script]` block automatically wraps your JavaScript in an IIFE to prevent global scope contamination.
```ini
@_script_@: scoped: true;
  const privateVar = 10;
@_end_@
```

### Advanced Element-Level Scoping (`self` Isolation)
For dynamic client-side runtime logic (i.e. code that runs in the browser attached to specific UI blocks), SomMark automatically generates a secure, unique element tracking ID (`data-sommark-id`) and provides an isolated execution context.

Within a block-level runtime script, a localized `self` constant is automatically declared and resolved using a standard query selector:
```javascript
(async function(){
  const self = document.querySelector('[data-sommark-id="sommark-button-xxxxxx"]');
  if (self) {
    // Your block-specific interactive script goes here!
    self.addEventListener('click', () => { ... });
  }
})();
```
This guarantees bulletproof component isolation without needing a modern heavy framework, preventing standard issues like browser-side table hoisting or module boundaries.

### Context-Aware Escaping (The Escape-Free Trinity)
By default, all content is escaped to prevent XSS. However, the trinity of At-Blocks below explicitly **disables escaping** for their content to preserve code and style integrity while keeping the outer structure safe:

1.  **`@_style_@`**: Injects raw CSS.
2.  **`@_script_@`**: Injects raw JavaScript.
3.  **`@_raw_@`**: Injects raw HTML markup.

---

## 7. Core Advantages Over Raw HTML

While you can write standard HTML5, SomMark provides several major architectural advantages that raw HTML lacks:

1.  **Built-in Module System**: SomMark supports native imports (`[import]`) and component usage (`[$use-module]`). This allows you to split your UI into reusable parts, creating a true component library without needing a heavy JavaScript framework.
2.  **Direct Styling Engine**: You can use CSS properties (like `color`, `fontSize`, or `padding` or any other CSS property) as **global attributes** directly in the block header. SomMark merges these into the `style` property automatically, making it much cleaner and faster to write than a standard HTML `style="..."` string.
3.  **Build-Time Static Logic & Sandboxing**: Execute sandboxed JavaScript at compile-time (using standard or asynchronous code) to dynamically compute variables, perform calculations, or fetch third-party API data, baking the results directly into clean, optimized static HTML before it reaches the client.
4.  **Native Loop System (`[for-each]`)**: Render complex lists or iterative structures cleanly using `[for-each = items: [array], as: "item"]` at compile-time, eliminating the need to write redundant HTML markup or run costly client-side rendering code.
