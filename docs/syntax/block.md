# Blocks

Blocks are the primary containers in SomMark, used to group, style, and organize structural content.

---

## 1. Syntax

A block starts with `[identifier]` and closes with a matching `[end:identifier]` or self-closing `!` if the block has no content.

### Standard Block
```ini
[section]
  This is content inside a block container.
[end:section]
```

### Named End Block `[end:name]` (Recommended)

The recommended way to close a block is to include the block name in the end tag:

```ini
[div = class: "card"]
  [h1]Welcome[end:h1]
[end:div]
```

This makes it easy to see which block is being closed — especially in long or deeply nested templates.

A plain `[end]` works too:
```ini
[div = class: "card"]
  [h1]Welcome[end]
[end]
```
But named end blocks `[end:name]` help you catch unclosed or mismatched blocks quickly.


> [!TIP]
> Use `[end:name]` for all blocks. The effort is minimal and the benefit — readable, easy-to-debug templates — is large.

### Multiline Block Headers
Block headers can span multiple lines. Whitespace and comments inside headers are ignored.
```ini
[
  div                   # The block name
  =                     # Start of props
  class: "container",   # Named prop
  "main-layout"         # Positional prop
]
  Block body content...
[end:div]
```

---

## 2. Rendering Outputs

### HTML Format
* **Smark Input:**
  ```ini
  [div = class: "card"]
    Hello World
  [end:div]
  ```
* **Rendered Output:**
  ```html
  <div class="card">
    Hello World
  </div>
  ```

### MDX Format
* **Smark Input:**
  ```ini
  [Card = title: "Welcome"]
    Hello World
  [end:Card]
  ```
* **Rendered Output:**
  ```jsx
  <Card title="Welcome">
    Hello World
  </Card>
  ```

---

## 3. Block Guidelines

### I. Infinite Nesting
Blocks can be nested inside each other without any depth limit.
```ini
[article]
  [h1]Title[end:h1]
  [div = class: "content"]
    [p]Paragraph within a div.[end:p]
  [end:div]
[end:article]
```

### II. Self-Closing Blocks
For elements that don't need a body (like line breaks or images), append `!` inside the header to omit `[end]`. See [Self-Closing Blocks](self-closing.md) for details.
```ini
[br!]
[img = src: "logo.png" !]
```

### III. Reserved Keywords
`end`, `import`, `slot`, `for-each`, and `$use-module` are strictly reserved core keywords. You cannot use them as custom block identifiers.
```ini
# Triggers Parser Error
[end !]
```
