# register

The `register` method defines how a SomMark identifier is transformed into its final output format.

**Syntax:** `mapper.register(id, render, options)`

---

## 1. Identifiers

*   **Single ID**: Use for unique tags.
    ```js
    mapper.register("p", function({ content }) {
        return this.tag("p").body(content);
    });
    ```
*   **Multi-IDs (Aliases)**: Map multiple labels to the same logic.
    ```js
    mapper.register(["b", "bold"], function({ content }) {
        return this.tag("b").body(content);
    });
    ```

---

## 2. Options

The third argument is a configuration object that controls both the **Transpiler** and the **Validator**.

### Core Pipeline
*   **`escape`**: (Default: `true`). If `false`, the engine will not escape HTML characters in the body.
*   **`type`**: Hints for validation (e.g., `"Block"`, `"Inline"`, `"AtBlock"`, `"Any"`).

### Transpilation Control
For complex needs, you can use these advanced settings to change how the engine handles your tags:

*   **[`resolve`](resolve.md)**: Fully process children before the renderer starts.
*   **[`handleAst`](handleAst.md)**: Take full manual control of the tag's AST node.
*   **[`trimAndWrapBlocks`](trimAndWrapBlocks.md)**: Automatically manage whitespace and newlines.
*   **[`rules`](rules.md)**: Pass custom metadata or structural flags to the renderer.

---

## 3. The Render Function

The renderer is a function that receives a **Context Object** containing:
*   `content`: The processed body text (or placeholder).
*   `args`: An object of arguments passed in Smark.
*   `ast`: The raw AST node for the tag.
*   `textContent`: The raw, unformatted text from the body.
*   `nodeType`: The type of the node being rendered.

> [!IMPORTANT]
> Always use a standard `function` (not an arrow function) if you need access to mapper utilities via **`this`**, such as `this.tag()` or `this.md`.
