# register

Links a block name to a render function.

**Syntax:**
```js
mapper.register(id, render, options)
```

**Example:**
```js
import { Mapper } from "sommark";

const mapper = new Mapper();

mapper.register("bold", function({ content }) {
    return this.tag("strong").body(content);
});
```

---

## Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` \| `array` | Yes | Block name, or an array of aliases. |
| `render` | `function` | Yes | The function that formats this block. Receives a [context object](#2-the-render-function). |
| `options` | `object` | No | Configuration for parsing, validation, and rendering. See [Options](#3-options). |

> Always use a standard `function` (not an arrow function) if you need `this` to access mapper utilities like `this.tag()`, `this.escapeHTML()`, or `this.md`.

---

## 1. Identifiers

The first argument is the block name. Pass a string for a single name, or an array to map multiple names to the same renderer.

**Single name:**
```js
mapper.register("p", function({ content }) {
    return this.tag("p").body(content);
});
```
```ini
[p]Hello World[end:p]
```
```html
<p>Hello World</p>
```

**Multiple names (aliases):**
```js
mapper.register(["b", "bold", "strong"], function({ content }) {
    return this.tag("strong").body(content);
});
```
```ini
[b]Hello[end:b]
[bold]Hello[end:bold]
[strong]Hello[end:strong]
```
```html
<strong>Hello</strong>
<strong>Hello</strong>
<strong>Hello</strong>
```

---

## 2. The Render Function

The render function receives a context object with these properties:

| Property | Type | Description |
| :--- | :--- | :--- |
| `props` | `object` | Props passed to the block. |
| `content` | `string` | The rendered inner content, or a placeholder if `resolve: false`. |
| `textContent` | `string` | The raw plain text inside the block, ignoring child block markup. |
| `nodeType` | `string` | Always `"Block"` in v5. |
| `isSelfClosing` | `boolean` | `true` if this instance was called with `!` (e.g. `[id = ... !]`). |
| `ast` | `object` | The raw AST node. Only usable when `handleAst: true`. |
| `renderChild` | `async function` | Renders a child node from `ast.body` and returns its output as a string. Only available when `handleAst: true`. See [`renderChild`](renderChild.md). |
| `...custom` | `any` | Any extra properties a parent renderer passed when calling `renderChild(child, { ... })`. The transpiler delivers them transparently — declare the name in your function and it arrives as a named parameter. |

---

### Context Examples

#### Props (`props`)

Both positional and named props are stored in the same `props` object. Positional props use string indices starting from `"0"`.

```ini
[Profile = "Adam", theme: "dark", role: "admin"][end:Profile]
```

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

#### Transpiled Content (`content`)

By default (`resolve: false`), `content` holds a placeholder token that SomMark replaces after rendering. This is faster and works for most cases.

If you need to read or manipulate the content string (e.g. `.trim()`, `.toUpperCase()`), set `resolve: true`.

```js
// Default — just wrap the content, no need to resolve
mapper.register("box", function({ content }) {
    return this.tag("div").attributes({ class: "box" }).body(content);
});

// resolve: true — manipulate the actual content string
mapper.register("shout", function({ content }) {
    return this.tag("p").body(content.trim().toUpperCase());
}, { resolve: true });
```

---

#### Raw Text (`textContent`)

`textContent` gives you the plain text inside the block, with no child block markup. Useful for word counters, character limits, or syntax highlighters.

```ini
[stats]Hello [strong]World[end:strong][end:stats]
```

- `content` → `"Hello <strong>World</strong>"`
- `textContent` → `"Hello World"`

```js
mapper.register("word-count", function({ textContent }) {
    const count = textContent.trim().split(/\s+/).length;
    return `<div>Words: ${count}</div>`;
});
```

---

#### Self-Closing (`isSelfClosing`)

`isSelfClosing` is `true` when the block instance is called with a trailing `!`. Use this to handle both inline and block forms of the same element.

> [!NOTE]
> `isSelfClosing` detects how a specific block was called. It is different from `rules.is_self_closing`, which is a static validator rule that forces a block to *only* accept the self-closing form and throws an error if an `[end]` is present.

**Example — inline vs fenced code:**

```ini
[code = "Hello World" !]
```
```md
`Hello World`
```

```ini
[code = "js"]
function greet() {
  return "Hello";
}
[end:code]
```
````md
```js
function greet() {
  return "Hello";
}
```
````

```js
mapper.register("code", ({ props, content, isSelfClosing }) => {
    if (isSelfClosing) {
        const text = safeArg({ props, index: 0, key: "text", fallBack: "" });
        return `\`${text}\``;
    }
    const lang = safeArg({ props, index: 0, key: "lang", fallBack: "" });
    return md.codeBlock(content, lang);
}, { escape: false });
```

---

#### Custom properties from a parent renderer

When a parent block uses `renderChild(child, { ... })`, whatever properties it
passes arrive in the child's render function as named parameters — alongside
`props`, `content`, and everything else. The transpiler just delivers them; it
does not validate or use them itself.

This is how parent blocks share context with their children — things like the
current indent level, whether the child is inside a list, or any other state
the child needs to know to render correctly.

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
                                               │  }) { ... }                │
                                               └────────────────────────────┘
```

**SomMark input:**

```ini
[list]
  [item]Home[end:item]
  [item]Docs[end:item]
  [item]Blog[end:item]
[end:list]
```

**Mapper:**

```js
// Parent — passes isListItem and indentLevel to every child it renders
mapper.register("list", async function ({ ast, renderChild }) {
    let out = "";
    for (const child of ast.body) {
        if (child.type === "Block") {
            out += await renderChild(child, { isListItem: true, indentLevel: 1 });
        }
    }
    return out;
}, { handleAst: true });

// Child — receives isListItem and indentLevel as named parameters
mapper.register("item", function ({ content, isListItem = false, indentLevel = 0 }) {
    const indent = "  ".repeat(indentLevel);
    return isListItem ? `${indent}- ${content}\n` : `${indent}${content}\n`;
});
```

**Output:**

```
  - Home
  - Docs
  - Blog
```

The names are completely up to you — `isListItem` and `indentLevel` are not
reserved. Parent and child just need to agree on the same names.

---

#### Raw AST (`ast`)

When you need full control over rendering — for example building tables or lists — set `handleAst: true`. This disables automatic child rendering and passes the raw `ast` node directly to your function so you can walk the children yourself.

```js
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

## 3. Options

Pass a configuration object as the third argument:

```js
mapper.register(id, render, { ...options });
```

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| [`escape`](escapeHtml.md) | `boolean` | `true` | Auto-escape special characters in child text nodes. Set to `false` to output raw HTML. |
| [`resolve`](resolve.md) | `boolean` | `false` | Fully render children before calling your function. Required if you manipulate `content`. |
| [`handleAst`](handleAst.md) | `boolean` | `false` | Disable auto-rendering and receive the raw AST node instead. |
| [`trimAndWrapBlocks`](trimAndWrapBlocks.md) | `boolean` | `false` | Strip blank lines from block edges and wrap multi-line content in newlines. |
| [`rules`](rules.md) | `object` | `{}` | Validator constraints: `is_self_closing`, `is_empty_body`, `required_args`. |

---

### Option Examples

**`escape: false` — output raw HTML:**
```js
mapper.register("raw", function({ content }) {
    return this.tag("pre").body(content);
}, { escape: false });
```

**`resolve: true` — manipulate content:**
```js
mapper.register("clean", function({ content }) {
    return this.tag("span").body(content.trim().toLowerCase());
}, { resolve: true });
```

**`handleAst: true` — walk children manually:**
```js
mapper.register("list", async function ({ ast, renderChild }) {
    let items = "";
    for (const child of ast.body) {
        if (child.type === "Block") {
            items += await renderChild(child);
        }
    }
    return `<ul>\n${items}</ul>\n`;
}, { handleAst: true });
```

**Custom options** — any extra key you pass is stored in `options` and accessible inside [`text()`](text.md):
```js
mapper.register("comment", function({ content }) {
    return this.tag("span").attributes({ class: "user-comment" }).body(content);
}, { censor: true });

mapper.text = function(text, options) {
    return options?.censor ? text.replace(/badword/gi, "****") : text;
};
```

---

[Read rules.md](rules.md) | [Read resolve.md](resolve.md) | [Read handleAst.md](handleAst.md) | [Read renderChild.md](renderChild.md) | [Read escapeHtml.md](escapeHtml.md) | [Read trimAndWrapBlocks.md](trimAndWrapBlocks.md)
