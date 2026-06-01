# register

Registers a custom tag. It links a tag name to a function that formats it.

**Syntax:** 
```js
mapper.register(id, render, options)
```

**Usage:**
```js
import { Mapper } from "sommark";
const mapper = new Mapper(); // or Mapper.define({})
mapper.register("bold", function({ content }) {
    return this.tag("strong").body(content);
});
```

### Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`id`** | `string` \| `array` | Yes | The tag identifier (e.g., `"p"`) or an array of aliases (e.g., `["b", "bold"]`). |
| **`render`** | `function` | Yes | The callback function that formats the tag. It receives a context object containing `{ content, args, textContent, nodeType, isSelfClosing, ast }` (detailed in [Section 2](#2-the-render-function)). |
| **`options`** | `object` | No | A configuration object to customize parsing, validation, and rendering (detailed in [Section 3](#3-options)). |

---

## 1. Identifiers
The first argument to the `register` method is the identifier of the tag. It can be a string or an array of strings. 

*   **Single ID**: Use for unique tags.
    ```js
    mapper.register("p", function({ content }) {
        return this.tag("p").body(content);
    });
    ```
    
    ```ini
    # Input
    [p]Hello World[end]
    ```

    ```html
    <!-- Output -->
    <p>Hello World</p>
    ```

*   **Multi-IDs (Aliases)**: Map multiple labels to the same logic.
    ```js
    mapper.register(["b", "bold", "Bold", "BOLD", "strong", "Strong", "STRONG"], function({ content }) {
        return this.tag("strong").body(content);
    });
    ```

    ```ini
    # Input
    [b]Hello World[end]
    [bold]Hello World[end]
    [Bold]Hello World[end]
    [BOLD]Hello World[end]
    [strong]Hello World[end]
    [Strong]Hello World[end]
    [STRONG]Hello World[end]
    ```

    ```html
    <!-- Output -->
    <strong>Hello World</strong>
    <strong>Hello World</strong>
    <strong>Hello World</strong>
    <strong>Hello World</strong>
    <strong>Hello World</strong>
    <strong>Hello World</strong>
    <strong>Hello World</strong>
    ```

---

## 2. The Render Function

The second argument is the renderer function. It receives a **Context Object** with the following properties:

| Property | Type | Description |
| :--- | :--- | :--- |
| **`args`** | `object` | Key-value arguments passed to the tag/block (e.g., `[tag = src: "img.png"]`). |
| **`content`** | `string` | The transpiled inner content (or a placeholder if `resolve: false`). |
| **`textContent`** | `string` | The raw, unformatted text within the tag/block and its children. |
| **`nodeType`** | `string` | The node type (`"Block"`, `"Inline"`, or `"AtBlock"`). |
| **`isSelfClosing`** | `boolean` | (Blocks only) `true` if the block tag was invoked with a trailing `!` (e.g., `[tag!]`). |
| **`ast`** | `object` | The raw AST node representing this block/tag. |

> [!IMPORTANT]
> Always use a standard `function` (not an arrow function) if you need access to mapper utilities (like `this.tag()`, `this.escapeHTML()`, or `this.md`) via the **`this`** keyword.

---

### Parameter Examples

#### 1. Arguments (`args`)

All arguments (positional and named) are stored in the same `args` object:
*   Positional arguments are saved as string indices starting from `"0"` (e.g. `"0"`, `"1"`).
*   Named arguments are saved by their key name (e.g., `theme`).

##### Smark Input
```ini
[Profile = "Adam", theme: "dark", role: "admin"][end]
```

##### Context values
```json
{
  "0": "Adam",
  "1": "dark",
  "2": "admin",
  "theme": "dark",
  "role": "admin"
}
```

---

#### 2. Transpiled Body (`content`)

By default, the engine uses **Lazy Evaluation** (`resolve: false`). In this mode, `content` holds a temporary placeholder token (e.g. `SOMMARKBODYPLACEHOLDER...`) which sommark automatically replaces later. 

If you need to edit or manipulate the inner text (like calling `.trim()` or `.toLowerCase()`), you **MUST** set `{ resolve: true }` in the options.

##### Renderer Code
```javascript
// Default Lazy Mode: Just wrapping content (Fast, no resolve needed)
mapper.register("box", function({ content }) {
  return this.tag("div").attributes({ class: "box" }).body(content);
});

// Manipulation Mode: Editing string (Must set resolve: true)
mapper.register("clean", function({ content }) {
  return this.tag("span").body(content.trim().toLowerCase());
}, { resolve: true });
```

---

#### 3. Raw Body Text (`textContent`)

Unlike `content`, `textContent` returns the raw, unformatted plain text within the block, ignoring any transpiled child tags. This is ideal for word/character counters or syntax highlighters.

##### Smark Input
```ini
[stats]Hello [strong]World[end][end]
```

##### Context values
*   `content` $\rightarrow$ `"Hello <strong>World</strong>"`
*   `textContent` $\rightarrow$ `"Hello World"`

##### Renderer Code
```javascript
mapper.register("word-count", function({ textContent }) {
  const count = textContent.trim().split(/\s+/).length;
  return `<div>Words: ${count}</div>`;
});
```

---

#### 4. Polymorphic Tags (`nodeType`)

The `nodeType` parameter specifies if the tag was invoked as a `"Block"`, `"Inline"`, or `"AtBlock"`. You can use this to render different structures for the same tag based on its context.

##### Renderer Code
```javascript
mapper.register("note", function({ content, nodeType }) {
  if (nodeType === "Inline") {
    return `<span class="inline-note">${content}</span>`;
  }
  return `<div class="block-note">${content}</div>`;
}, {
  // available types: ["any", "Block", "Inline", "AtBlock"]
  type: "any" // Tell SomMark this tag supports all types
  // You can also use an array like ["Block", "Inline"] to specify the exact types
});
```

---

#### 5. Self-Closing Blocks (`isSelfClosing`)

The `isSelfClosing` parameter is a dynamic boolean representing whether the specific instance was invoked with a trailing exclamation mark `!` (e.g. `[alert!]`).

> [!WARNING]
> Do not confuse the dynamic **`isSelfClosing`** context parameter with the static **`rules: { is_self_closing: true }`** option:
> *   `isSelfClosing` (in the renderer context): Detects if a specific block *instance* in the source was self-closed.
> *   `rules.is_self_closing` (in the options object): A static validation rule telling the parser that this tag CAN be self-closed without throwing a missing body/end error.

##### Smark Input
```ini
[alert = type: "error" !]
```

##### Renderer Code
```javascript
mapper.register("alert", function({ content, args, isSelfClosing }) {
  const alertBox = this.tag("alert");

  if (args.type) {
    alertBox.attributes({ class: `alert-${args.type}` });
  }

  // Handle dynamic self-closing block instance
  if (isSelfClosing) {
    return alertBox.attributes({ class: "alert-empty" }).selfClose();
  }

  return alertBox.body(content);
}, {
  type: "Block",
  rules: {
    is_self_closing: true // forces this tag to only be rendered as a self-closing block (e.g. `[tag!]`). If an [end] is present, SomMark will throw an error.
  }
});
```

---

#### 6. Raw AST Node (`ast`)

When you need total control over rendering (e.g., building custom structures like **Tables** or **Lists**), you can set `handleAst: true`. This turns off automatic child rendering and hands the raw `ast` object directly to your renderer, allowing you to walk the nodes manually.

##### Renderer Code
```javascript
mapper.register("gallery", function({ ast }) {
  // Manually walk the AST to find all 'image' nodes inside this block
  let imagesHtml = "";
  for (const child of ast.body) {
    if (child.id === "image") {
      const src = child.args.src || "placeholder.png";
      const alt = child.args.alt || "";
      imagesHtml += "  " + this.tag("img").attributes({ src, alt }).selfClose() + "\n";
    }
  }
  
  return this.tag("div").attributes({ class: "gallery" }).body("\n" + imagesHtml);
}, {
  type: "Block",
  handleAst: true // Allows direct access to the AST object and stops transpiler from rendering children
});
```

---

## 3. Options

You can pass a configuration object as the third argument to customize how your tag is parsed, validated, and rendered:

```javascript
// Third argument is optional configuration object: { ...options }
mapper.register(id, render, { ...options });
```

### Supported Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **[`escape`](escapeHtml.md)** | `boolean` | `true` | When `true`, automatically HTML-escapes all special characters inside child text nodes. Set to `false` to output raw HTML. |
| **`type`** | `string` \| `array` | `"Block"` | Validation type constraints for the parser (e.g., `"Block"`, `"Inline"`, `"AtBlock"`, `"any"`). |
| **[`resolve`](resolve.md)** | `boolean` | `false` | When `true`, children are fully rendered first, passing the actual output string in `content` instead of a temporary placeholder. Required if you need to manipulate the `content` string (e.g., `content.trim()`). |
| **[`handleAst`](handleAst.md)** | `boolean` | `false` | When `true`, turns off automatic child rendering. The renderer receives a raw AST containing child nodes to process or walk manually. |
| **[`trimAndWrapBlocks`](trimAndWrapBlocks.md)** | `boolean` | `false` | Automatically removes blank leading/trailing lines from block content and wraps multi-line blocks in newlines. |
| **[`rules`](rules.md)** | `object` | `{}` | Configures active validator constraints: supports `is_self_closing: true`, `is_empty_body: true`, and `required_args: [...]`. |

---

### Option Examples

#### Auto Escaping vs. Raw Output (`escape`)
```js
// 1. Automatically escapes special characters (Output: <strong>1 &lt; 2</strong>)
mapper.register("strong", function({ content }) {
  return this.tag("strong").body(content);
});

// 2. Disable escaping to output raw HTML code
mapper.register("raw-code", function({ content }) {
  return this.tag("pre").body(content);
}, { escape: false });
```

#### Modifying Content (`resolve`)
```js
// You MUST set resolve: true to manipulate the content string (e.g., trimming or casing)
mapper.register("clean", function({ content }) {
  return this.tag("span").body(content.trim().toLowerCase());
}, { resolve: true });
```

#### Manual AST Processing (`handleAst`)
```javascript
// Skip auto-rendering to manually extract text and build list items
mapper.register("unordered-list", function({ ast }) {
  let listItems = "";
  for (const child of ast.body) {
    if (child.type === "Text") {
      listItems += "  " + this.tag("li").body(this.escapeHTML(child.text.trim())) + "\n";
    }
  }
  return this.tag("ul").body("\n" + listItems);
}, {
  type: "Block",
  handleAst: true // Tell sommark to pass the raw AST to this renderer
});
```

> [!NOTE]
> **Custom Options:** You can pass any custom properties inside the `options` object. While they do not trigger native compiler features, they are highly useful for custom processing inside **[`atBlockBody()`](atBlockBody.md)**, **[`text()`](text.md)**, and **[`inlineText()`](inlineText.md)**:
> 
> ```javascript
> // 1. Register a tag with a custom static option
> mapper.register("comment", function({ content }) {
>   return this.tag("span").attributes({ class: "user-comment" }).body(content);
> }, { type: "Inline", censor: true });
> 
> // 2. Read the option dynamically inside a filter
> mapper.inlineText = function(text, options) {
>   return options?.censor ? text.replace(/badword/gi, "****") : text;
> };
> ```

---

[Read rules() for more info](rules.md)
[Read resolve() for more info](resolve.md)
[Read handleAst() for more info](handleAst.md)
[Read escapeHtml() for more info](escapeHtml.md)
[Read trimAndWrapBlocks() for more info](trimAndWrapBlocks.md)
