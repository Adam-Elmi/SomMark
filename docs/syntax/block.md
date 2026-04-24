# Blocks

**Blocks** are used to **group and organize** your content into logical sections. Think of them as the "Big Pieces" of your document that hold everything else together.

Unlike Inlines (for styling words) and At-Blocks (for raw code), Blocks are **containers**. This means you can put any other element inside a block—including more blocks!

## 1. Core Syntax

A standard block is defined by an opening tag `[identifier]` and a closing tag `[end]`.

```ini
[section]
  This is content inside a structural block.
[end]
```

### Flexible Headers (V4)
SomMark V4 allows you to format your block headers across multiple lines with comments and extra whitespace. The parser will intelligently "skip the junk" to find your metadata.

```ini
[
  div                   # The identifier
  =                     # Start of arguments
  class: "container",   # Named argument
  "main-layout"         # Positional argument
]
  Block body content...
[end]
```

---

## 2. Key Principles

### I. Infinite Nesting
Blocks can be nested inside each other without any depth limit. The parser maintains a strict hierarchy to ensure your document structure (AST) is always perfectly organized.

```ini
[article]
  [h1]Title[end]
  [div = class: "content"]
    [p]Paragraph within a div, within an article.[end]
  [end]
[end]
```

### II. Strict Whitespace Preservation
The body of a block follows a **"What You Write Is What You Get"** standard. Every newline, space, and indentation inside the block (between the header and the `[end]`) is preserved exactly as provided.

### III. Optional Metadata
Blocks accept both **Positional** and **Named** arguments after the `=` sign. 
*   **Positional**: `[tag = "value"]`
*   **Named**: `[tag = key: "value"]`
*   **Quoted keys**: `[tag = "my-key": "value"]` (Useful for characters like `-` or `:`)

---

---

## 3. Strict Closing Rule

**Every Block must be explicitly closed** using the `[end]` keyword. If you forget to close a block, the parser will trigger an error.

```ini
[hr][end]
[p]This must be closed.[end]
```

## 4. Safety & Reserved Keywords

### The "End" Restriction
To prevent parser confusion and AST corruption, the word `end` is a **strictly reserved keyword**. You cannot name a block `[end]`.

> [!WARNING]
> Attempting to define `[end]` as a block identifier will trigger a **Parser Error**.

---
