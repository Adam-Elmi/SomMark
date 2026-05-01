# define (Static Method)

The `define` method is a static factory used to create a Mapper instance and configure its base properties and methods in a single object literal.

**Syntax:** `Mapper.define(configurationObject)`

---

## 1. How it Works (The "Overwriting" Rule)

The `define` method is a high-performance, brute-force configuration tool. It creates a `new Mapper()` and then iterates through your configuration object, attaching every key directly to the instance (`mapper[key] = value`).

> [!TIP]
> **Functional Equivalence**: `Mapper.define({ a: 1 })` is technically identical to:
> ```js
> const m = new Mapper();
> m.a = 1;
> ```
> Use `define` when you want a clean, declarative configuration block.

> [!WARNING]
> **This is NOT a merge operation.** If you provide a property like `options`, it will completely replace the default `options` object initialized by the `Mapper` constructor.

---

## 2. Technical Nuances

### Lexical Scope (`this`)
When defining methods within the object literal, always use the **`function`** keyword (or shorthand method syntax). Avoid arrow functions, as they will lose access to the mapper instance via `this`.

```js
const myMapper = Mapper.define({
    // Correct: 'this' points to myMapper
    text(val) {
        return this.escapeHTML(val); 
    }
});
```

### Core Method Overloading
`define` is the standard way to override the engine's built-in behavior for certain node types:

*   **`text(text, options)`**: Processes plain text.
*   **`comment(text)`**: Processes Smark comments.
*   **`getUnknownTag(node)`**: Handles tags that are not found in the `outputs` registry.
*   **`inlineText(text, options)`**: Custom helper often used by the engine for inline-only content.

---

## 3. Real Example: The Markdown Foundation

This is how the core **MARKDOWN** mapper is defined, showcasing property overwriting and helper registration.

```js
import { Mapper } from "sommark";

const MARKDOWN = Mapper.define({
    // Completely overwrites default options
    options: {
        trimAndWrapBlocks: false 
    },
    
    // Custom Text logic with smart escaping
    text(text, options) {
        if (options?.escape === false) return text;
        return this.md.smartEscaper(text);
    },

    // Custom Error/Unknown tag logic
    getUnknownTag(node) {
        return {
            render: ({ content }) => `<unknown>${content}</unknown>`,
            options: { type: "Inline" }
        };
    }
});
```

---

## 4. Usage Comparison

| Feature | `Mapper.define()` | `mapper.register()` |
| :--- | :--- | :--- |
| **Purpose** | Sets up the mapper's "DNA" and defaults. | Adds specific tags (labels) to the registry. |
| **Timing** | Happens at creation. | Happens after creation. |
| **Storage** | Attached directly to the instance. | Pushed into the `outputs` array. |
| **Scope** | Global (affects all rendering). | Local (affects specific tags). |

---

## 5. Custom Properties

One of the main advantages of `define` is the ability to attach custom state or metadata to your mapper. This is incredibly useful for passing project-wide variables into your render functions.

```javascript
const CV_MAPPER = Mapper.define({
    projectName: "My Resume",
    lastUpdated: "2024-05-01"
});

CV_MAPPER.register("Header", function({ content }) {
    // Custom properties are available via 'this'
    return `<h1>${this.projectName}: ${content}</h1>`;
});
```
