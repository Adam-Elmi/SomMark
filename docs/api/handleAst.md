# handleAst

The `handleAst` option grants you full manual control over the transpilation process for a specific tag. When enabled, the engine stops its automatic body processing and hands the raw AST node to your renderer.

---

## 1. How it Works

When `handleAst: true` is set, the transpiler **does not** try to resolve the body of your tag. Instead:

1.  It skips all automatic body handling.
2.  It passes the full `ast` object to your renderer.
3.  You are responsible for manually navigating the `ast.body` and deciding what to render.

---

## 2. Example: Custom Logic

This is the "Power User" mode, ideal for complex structural tags like **Tables** or **Lists** where you need to filter or reorder children before rendering them.

```js
import { transpiler } from "sommark/core";

mapper.register("CustomTable", async function({ ast }) {
    // Manually filter children to only find 'Row' tags
    const rows = ast.body.filter(node => node.id === "Row");
    
    // Manually call the transpiler on the filtered list
    const renderedRows = await transpiler({ 
        ast: rows, 
        mapperFile: this 
    });
    
    return this.tag("table").body(renderedRows);
}, { 
    handleAst: true 
});
```

---

## 3. When to Use It

*   **Complex Filtering**: If you need to skip specific child nodes (like ignoring text between rows).
*   **Structural Transformation**: If you need to wrap children in extra tags based on their position.
*   **Deep Inspection**: If you need to check arguments or IDs of child nodes before they are rendered.
