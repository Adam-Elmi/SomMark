# Blocks

Blocks are the primary containers in SomMark, used to group, style, and organize structural content.

---

## 1. Syntax

A block starts with `[identifier]` and closes with a matching `[end]` or self-closing `!` if the block does not have any content, for example `[br!]` or `[img = src: "logo.png" !]`. 

### Standard Block
```ini
[section]
  This is content inside a block container.
[end]
```

### Multiline Block Headers
For clean formatting, block headers can span multiple lines. Whitespace and comments inside headers are treated as structural junk and ignored.
```ini
[
  div                   # The tag name
  =                     # Start of props
  class: "container",   # Named prop
  "main-layout"         # Positional prop
]
  Block body content...
[end]
```

---

## 2. Rendering Outputs

### HTML Format
* **Smark Input:**
  ```ini
  [div = class: "card"]
    Hello World
  [end]
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
  [end]
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
  [h1]Title[end]
  [div = class: "content"]
    [p]Paragraph within a div.[end]
  [end]
[end]
```

### II. Self-Closing Blocks
For elements that don't need a body (like line breaks or images), append `!` inside the header to omit the `[end]` tag. See [Self-Closing Blocks](self-closing.md) for details.
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

