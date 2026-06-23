# handleAst

An option that gives your renderer full control over a block's children. When
`handleAst: true`, the engine stops automatic rendering and passes a cleaned
AST node directly to your render function alongside a `renderChild` helper.

---

## Syntax

```js
mapper.register(id, render, { handleAst: true })
```

---

## What reaches `ast.body`

The transpiler pre-processes several node types before handing control to your
renderer. Only three node types are ever present in `ast.body`:

| Node type | `child.type` | What it is |
| --------- | ------------ | ---------- |
| Block | `"Block"` | A nested block tag — has `.id`, `.props`, `.body`, `.isSelfClosing` |
| Text | `"Text"` | Plain text between blocks — has `.text` |

Everything else is handled by the transpiler automatically and never appears in
`ast.body`:

| What the transpiler handles | Where the result goes |
| --------------------------- | --------------------- |
| `${ }$` static logic blocks | Executed; result folded into `textContent` |
| `# comment` and `### comment ###` | Processed by `comment()` / `commentBlock()`; result folded into `textContent` |
| Runtime logic | Pre-processed; result folded into `textContent` |

So if your renderer needs the rendered text of all inline content (including
evaluated expressions and comments), read `textContent` — don't rebuild it by
walking `ast.body`.

---

## `renderChild`

`renderChild(child)` renders any child node through the full transpiler
pipeline and returns the output as a string. You can also pass a plain object
— the transpiler forwards its properties to the child renderer as named
parameters. The child declares the names it wants, and uses them. This is how
parent blocks pass context like indent level or rendering mode to their children.

```js
for (const child of ast.body) {
    if (child.type === "Block") {
        const out = await renderChild(child);
        // out is the rendered string for that child
    }
}
```

---

## Example — selective child rendering

```js
import SomMark, { Mapper } from "sommark";

const mapper = new Mapper();

mapper.register("section", async function ({ ast, renderChild }) {
    let out = "";
    for (const child of ast.body) {
        if (child.type === "Block") {
            out += await renderChild(child);
        } else if (child.type === "Text") {
            out += child.text.trim();
        }
    }
    return `<section>\n${out}</section>\n`;
}, { handleAst: true });
```

---

## Example — passing custom data to child renderers

The parent passes `indentLevel` and `isListItem` — the child declares and uses them:

```js
mapper.register("list", async function ({ ast, renderChild, indentLevel = 0 }) {
    let out = "";
    for (const child of ast.body) {
        if (child.type === "Block") {
            out += await renderChild(child, { indentLevel: indentLevel + 1, isListItem: true });
        }
    }
    return out;
}, { handleAst: true });

mapper.register("item", function ({ content, indentLevel = 0, isListItem = false }) {
    const indent = "  ".repeat(indentLevel);
    return isListItem ? `${indent}- ${content}\n` : `${indent}${content}\n`;
});
```

---

## Behavior when `handleAst: false` (default)

The engine compiles all children automatically and delivers the result as the
`content` string. The `ast` parameter is disabled — accessing any property on
it throws a transpiler error:

```js
mapper.register("box", function ({ ast, content }) {
    // ast.id throws here because handleAst is false
    return `<div>${content}</div>`;
});
// ERROR: Access Error: Attempted to access 'ast.id', but 'ast' is undefined
// because 'handleAst' is false...
```

---

## When to use it

- **Structural blocks** — tables, sequences, nested configs where you need to
  control how each child contributes to the output
- **Depth tracking** — pass a `depth` counter through `renderChild` so nested
  blocks can indent correctly
- **Selective filtering** — skip or reorder children based on their `.id` or
  `.type`
- **Direct prop inspection** — read `.props` or `.isSelfClosing` on a child
  before deciding how to render it
