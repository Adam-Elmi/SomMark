# Plain Text

SomMark treats all content that isn't a structural marker (Block or Comment) as **Plain Text**. This is captured as tokens and organized by the parser into text nodes.

---

## 1. Text Parsing & AST Representation

Unlike many parsing engines, SomMark does not possess a specific "Paragraph" node type in its AST. Instead, all text is represented by a single node type: **`TEXT`**.

* **Continuous Consumption**: The parser gathers all contiguous text, whitespace, newlines (both single and double newlines), and resolved placeholders into one continuous `TEXT` node.
* **Termination Boundaries**: Text consumption only stops when the parser encounters a structural token, such as an opening bracket `[` or a logic block (`${}` / `runtime ${}`).
* **Multi-Line Text**: A single `TEXT` node can span multiple lines and paragraphs, preserving all layout details exactly as written in the template.

```ini
This is line one.
This is line two.

This is a new paragraph block, but it is parsed into the same continuous AST TEXT node.
```

---

## 2. Nesting Depth vs. Indentation Offset

SomMark distinguishes between how deep a node is nested in the hierarchy versus its visual indentation on the line:

### I. AST Nesting Depth (`node.depth`)
* Tracks the **structural nesting depth** (i.e. how many block levels deep the node is within parent blocks).
* The root-level nodes start with a depth of `1`, and each nested child block increments this value by `1`.

### II. Indentation Character Offset (`node.range.start.character`)
* Tracks the **column index (0-indexed)** of where the block or text starts on its line.
* Captured directly from the lexer, representing the exact number of leading spaces or tabs.

---

## 3. Automatic Relative Dedenting

To make nesting convenient and readable, the transpiler dynamically dedents child text relative to its parent block's starting column character offset.

During transpilation:
1. The transpiler retrieves the parent block's starting column via `parentBlock.range.start.character`.
2. It calls the `dedentBy(text, amount)` helper on the child `TEXT` node.
3. This helper strips up to `amount` leading spaces or tabs from each line of the text.

### Example:

```ini
  [div]
    Line one.
    Line two.
  [end:div]
```

* The parent `[div]` starts at column `2` (`parentBlock.range.start.character = 2`).
* The body text starts with 4 spaces of indentation: `\n    Line one.\n    Line two.\n  `.
* After relative dedenting by `2` spaces, the final HTML output is beautifully aligned:

```html
<div>
  Line one.
  Line two.
</div>
```

---

## 4. Whitespace & Structural Junk

SomMark handles whitespace differently depending on the context:

### I. Body Context (Text)
In the body of a document or within a block's children, SomMark practices **Strict Preservation**. Every space and every single newline is preserved exactly as written (before relative dedenting is applied).

### II. Header Context (Block Definitions)
Inside the `[...]` of a block header, whitespace is completely ignored. This lets you spread a block header across multiple lines for readability without affecting the output.

```ini
[
  div =
  class: "flex"
]
  Content...
[end:div]
```

---

## 5. Escaping Special Characters

Characters that have a structural role in SomMark (`[`, `#`) must be escaped with a backslash `\` to be treated as literal text.

* **Standard Unescaping**: The parser removes the backslash and keeps the character that follows it as literal text.
* **Non-Logic Keywords**: If `static` or `runtime` appear in text but are not followed by `${ ... }$`, the parser treats them as normal text — no escaping needed.

* `\[` → `[`
* `\#` → `#`
