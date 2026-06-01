# handleAst

A configuration option that grants you full manual control over how a tag's body is processed. When enabled, the engine stops automatic rendering and hands the raw AST node directly to your renderer.

---

**Syntax:**
```js
// Enabled via the third argument options object
mapper.register(id, render, { handleAst: true })
```

**Usage:**
```js
import { Mapper } from "sommark";
const mapper = new Mapper();

mapper.register("gallery", function({ ast }) {
    let imagesHtml = "";
    for (const child of ast.body) {
        if (child.id === "image") {
            const src = child.args.src || "placeholder.png";
            // Use this.tag() for safe programmatic elements
            imagesHtml += this.tag("img").attributes({ src }).selfClose() + "\n";
        }
    }
    return this.tag("div").attributes({ class: "gallery" }).body("\n" + imagesHtml);
}, { type: "Block", handleAst: true });
```

---

### Example: Custom Structural Filtering

Use `handleAst: true` to build nested elements like lists by selectively walking and filtering the raw AST children:

```js
import { Mapper } from "sommark";
const mapper = new Mapper();

mapper.register("unordered-list", function({ ast }) {
    let listItems = "";
    
    for (const child of ast.body) {
        // Walk and render only child elements that are of type "Text"
        if (child.type === "Text" && child.text.trim()) {
            listItems += "  " + this.tag("li").body(this.escapeHTML(child.text.trim())) + "\n";
        }
    }
    
    return this.tag("ul").body("\n" + listItems);
}, { type: "Block", handleAst: true });
```

---

### Behavior when `handleAst: false` (Default)

When `handleAst` is `false` (default), the engine automatically compiles all children and provides the formatted text inside `content`. 

In this mode, the **`ast` parameter is disabled**. To protect developers from configuration mistakes, trying to access any property on `ast` will throw a descriptive `Transpiler Error`:

```js
mapper.register("box", function({ ast, content }) {
    // Under handleAst: false, attempting to read ast.id throws:
    console.log(ast.id);
    
    // ERROR: [Transpiler Error]: Access Error: Attempted to access 'ast.id', 
    // but 'ast' is undefined because 'handleAst' is false...
    
    return this.tag("div").body(content);
}, { type: "Block" }); // handleAst is false by default
```

> [!NOTE]
> If you need to access AST properties (like `ast.id`, `ast.body`, or `ast.type`), you must set `handleAst: true` in your tag's options object.

---

### When to Use It

*   **Custom Layouts**: Ideal for tables, grids, and lists where children require surrounding structural tags (e.g. `<ul>` and `<li>`).
*   **Selective Filtering**: Skip formatting spaces, blank lines, or irrelevant child elements.
*   **Direct Node Access**: Inspect attributes (`args`), ranges, or types of child elements before outputting them.
