# renderChild

## What is it?

When you register a block with [`handleAst: true`](handleAst.md), the
transpiler hands you the raw AST node and **stops rendering children
automatically**. You are now in full control — but that means you are also
responsible for rendering the children yourself.

`renderChild` is the function that does that. It takes one child node from
`ast.body`, runs it through the full transpiler pipeline, and gives you back
the rendered string for that node.

Think of it as: **"hey transpiler, render this one child for me."**

---

## Why do you need it?

Without `handleAst`, the transpiler renders all children for you and delivers
the combined result as `content`. You never think about individual children.

With `handleAst: true`, `content` is always an empty string — the transpiler
opted out of automatic rendering. If you want a child rendered, you call
`renderChild(child)` yourself. If you never call it, that child produces no
output.

```js
// Without handleAst — transpiler renders everything, you get it as content
mapper.register("box", function ({ content }) {
    return `<div class="box">${content}</div>`;
});

// With handleAst — you render each child yourself
mapper.register("box", async function ({ ast, renderChild }) {
    let out = "";
    for (const child of ast.body) {
        out += await renderChild(child);
    }
    return `<div class="box">${out}</div>`;
}, { handleAst: true });
```

Both produce the same output. The difference is that in the second one, you
decide what happens to each child before it ends up in the result.

---

## Signature

```js
async renderChild(child, { ...values }?) → Promise<string>
```

`renderChild` is always `async` — always `await` it.

The optional object lets you pass any custom data to the child renderer. The
transpiler forwards it transparently — whatever properties you include show up
as named parameters in the child's render function, as long as the child
declares them. This is how a parent block tells its children things like the
current indent level or what rendering mode they are in.

---

## Step 1 — Understand what is in `ast.body`

Before you can use `renderChild`, you need to know what nodes you are working
with. When `handleAst: true`, `ast.body` only contains two node types:

| `child.type` | What it is | What it contains |
| ------------ | ---------- | ---------------- |
| `"Block"` | A nested block tag | `.id` (tag name), `.props`, `.body`, `.isSelfClosing` |
| `"Text"` | Plain text between blocks | `.text` (the string) |

Everything else — compile-time JS `${ }$`, comments, runtime logic — is
**pre-processed by the transpiler before your renderer is called**. Their
results are folded into `textContent`. They never appear in `ast.body`.

So your loop will always look like this:

```js
for (const child of ast.body) {
    if (child.type === "Block") {
        // a nested block — use renderChild
    } else if (child.type === "Text") {
        // plain text — use child.text
    }
}
```

---

## Step 2 — Render all children (the simplest case)

If you just need to render everything in order and collect the output, you
can pass every child directly to `renderChild` without checking the type:

```js
mapper.register("section", async function ({ ast, renderChild }) {
    let out = "";
    for (const child of ast.body) {
        out += await renderChild(child);
    }
    return `<section>\n${out}</section>\n`;
}, { handleAst: true });
```

SomMark input:
```ini
[section]
  [h2]Hello[end:h2]
  [p]World[end:p]
[end:section]
```

Output:
```html
<section>
  <h2>Hello</h2>
  <p>World</p>
</section>
```

> `renderChild` handles `"Text"` nodes too — it passes them through the
> mapper's `text()` function the same way automatic rendering would. So if
> you don't need to treat text specially, just pass all nodes to `renderChild`
> without checking the type first.

---

## Step 3 — Filter children (selective rendering)

The real power of `handleAst` is that you can decide what to render and what
to skip. You inspect `child.id` (the tag name) before deciding what to do:

```js
// Only render [item] blocks, ignore everything else
mapper.register("menu", async function ({ ast, renderChild }) {
    let items = "";
    for (const child of ast.body) {
        if (child.type === "Block" && child.id === "item") {
            items += await renderChild(child);
        }
    }
    return `<ul>\n${items}</ul>\n`;
}, { handleAst: true });
```

SomMark input:
```ini
[menu]
  [item]Home[end:item]
  [item]Docs[end:item]
  [divider!]
  [item]Blog[end:item]
[end:menu]
```

Output — `[divider]` is skipped because it does not match `child.id === "item"`:
```html
<ul>
  <li>Home</li>
  <li>Docs</li>
  <li>Blog</li>
</ul>
```

---

## Step 4 — Read child props before rendering

A `"Block"` node's props are available on `child.props` before you call
`renderChild`. You can read them to make decisions about how to wrap or
transform the rendered output:

| Property | What it holds |
| -------- | ------------- |
| `child.id` | Tag name — `"item"`, `"h2"`, etc. |
| `child.props` | Raw props object (not yet transpiled) |
| `child.isSelfClosing` | `true` if written as `[tag!]` |
| `child.body` | The child's own children array |

> `child.props` values are raw — expressions like `${ var }$` are not yet
> resolved. They are resolved when you call `renderChild(child)`. Read
> `child.props` only when you need a quick check; call `renderChild` when you
> need the fully rendered result.

Example — build an HTML table where the `span` prop controls the colspan:

```js
mapper.register("row", async function ({ ast, renderChild }) {
    let cells = "";
    for (const child of ast.body) {
        if (child.type !== "Block" || child.id !== "cell") continue;
        const span = child.props?.span || "1";
        const content = await renderChild(child);
        cells += `  <td colspan="${span}">${content}</td>\n`;
    }
    return `<tr>\n${cells}</tr>\n`;
}, { handleAst: true });
```

---

## Step 5 — Pass custom data to child renderers

When you call `renderChild(child, { ... })`, the transpiler forwards whatever
properties you pass directly into the child renderer as named parameters. The
transpiler does not read or care about these properties — it just delivers
them. The child renderer declares the names it wants to receive, and uses them.

This is how a parent block communicates context to its children — things like
how deep in the tree they are, or what mode they are rendering in.

**How it flows:**

```
┌─────────────────────────────────┐
│  [list] renderer (parent)       │
│                                 │
│  renderChild(child, {           │
│    isListItem: true,  ──────────┼──────────────────────────────┐
│    indentLevel: 1               │                              │
│  })                             │                              ▼
└─────────────────────────────────┘            ┌────────────────────────────┐
                                               │  Transpiler                │
                                               │                            │
                                               │  delivers { isListItem,    │
                                               │  indentLevel } into the    │
                                               │  child's context           │
                                               └────────────────┬───────────┘
                                                                │
                                                                ▼
                                               ┌────────────────────────────┐
                                               │  [item] renderer (child)   │
                                               │                            │
                                               │  function ({               │
                                               │    content,                │
                                               │    isListItem,  ◄──────────┘
                                               │    indentLevel             │
                                               │  }) { ... }               │
                                               └────────────────────────────┘
```

**Example:**

```js
// Parent — knows it is building a list, tells each child about it
mapper.register("list", async function ({ ast, renderChild, indentLevel = 0 }) {
    let out = "";
    for (const child of ast.body) {
        out += await renderChild(child, {
            indentLevel: indentLevel + 1,
            isListItem: true
        });
    }
    return out;
}, { handleAst: true });

// Child — receives indentLevel and isListItem, uses them to format output
mapper.register("item", function ({ content, indentLevel = 0, isListItem = false }) {
    const indent = "  ".repeat(indentLevel);
    return isListItem ? `${indent}- ${content}\n` : `${indent}${content}\n`;
});
```

The names `indentLevel` and `isListItem` are not special — you can call them
anything. The parent and child just need to agree on the same names. This is
exactly how the built-in YAML mapper passes indent level and list/array context
through its nested blocks.

---

## Step 6 — Rearrange children

You are not forced to render children in order. Collect them first, then
render in whatever order you need:

```js
mapper.register("card", async function ({ ast, renderChild }) {
    const blocks = { head: null, body: null, foot: null };

    for (const child of ast.body) {
        if (child.type === "Block" && blocks[child.id] !== undefined) {
            blocks[child.id] = child;
        }
    }

    const head = blocks.head ? await renderChild(blocks.head) : "";
    const body = blocks.body ? await renderChild(blocks.body) : "";
    const foot = blocks.foot ? await renderChild(blocks.foot) : "";

    return `<div class="card">\n${head}${body}${foot}</div>\n`;
}, { handleAst: true });
```

SomMark input — order in source does not matter:
```ini
[card]
  [foot]Footer text[end:foot]
  [head]Card title[end:head]
  [body]Card content[end:body]
[end:card]
```

Output — always in head → body → foot order:
```html
<div class="card">
  <h3>Card title</h3>
  <p>Card content</p>
  <footer>Footer text</footer>
</div>
```

---

## Quick reference

```js
// Render one child
const out = await renderChild(child);

// Pass custom data — child receives it as named parameters
const out = await renderChild(child, { indentLevel: indentLevel + 1, isListItem: true });

// Render all children in order
for (const child of ast.body) {
    out += await renderChild(child);
}

// Handle Block and Text differently
for (const child of ast.body) {
    if (child.type === "Block") {
        out += await renderChild(child);
    } else if (child.type === "Text") {
        out += child.text.trim();
    }
}

// Render only a specific tag
for (const child of ast.body) {
    if (child.type === "Block" && child.id === "item") {
        out += await renderChild(child);
    }
}
```

---

## Key rules

- Always `await` — `renderChild` is always async.
- Only available when `handleAst: true` — it is not injected in normal render functions.
- Not calling `renderChild` on a child means that child produces no output — there is no fallback.
- `child.props` are raw — call `renderChild` if you need the child fully rendered; read `child.props` directly only for a quick prop check.
