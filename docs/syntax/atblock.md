# At-Blocks

**At-Blocks** are used specifically for **raw, unparsed content** that you don't want the engine to touch.

Think of them as "Safe Containers". Once the engine enters an At-Block, it stops looking for formatting or tags and just captures everything literally. This makes them the perfect choice for **code snippets, raw HTML, or XML** where you want your text to stay exactly as you wrote it.

## 1. Core Syntax

An At-Block consists of a structural header, an optional metadata section, and the raw body content terminated by `@_end_@`.

```r
@_code_@: lang: "javascript";
  const message = "This is raw content";
  console.log(message);
@_end_@
```

### The Semicolon Rule
The semicolon `;` is the most important part of an At-Block header. It acts as a **structural wall** that tells the engine exactly where the metadata ends and where the raw content begins.

*   `@_identifier_@;` — No metadata, body starts immediately.
*   `@_identifier_@: args;` — Metadata provided, body starts after `;`.

---

## 2. Flexible Headers (V4)

In SomMark V4, the header of an At-Block is **junk-aware**. You can spread your metadata across multiple lines and add comments without breaking the structure.

```r
@_
  code
_@: 
  "language": "python",   # Quotes allowed for keys
  theme: "monokai";       # Header ends here
def hello():
    print("Multi-line header!")
@_end_@
```

> [!TIP]
> Just like standard Blocks, At-Blocks support **Quoted Keys** (e.g., `"my-key": "value"`), allowing you to use characters that would otherwise be interpreted as structural markers.

---

## 3. Key Principles

### I. Raw Content Preservation
Unlike standard Blocks, the engine **stops parsing** once it passes the header semicolon. Everything inside the body is treated as literal text.
*   No nested Blocks.
*   No Inline Statements.
*   No structural interpretation.

### II. Whitespace Integrity
At-Blocks maintain 100% fidelity for whitespace and indentation. This makes them perfect for indentation-sensitive languages like Python, YAML, or literal code.

### III. Termination
Every At-Block **must** be closed with `@_end_@`. If the closing tag is missing, the engine will safely capture everything until the end of the file.

---

## 4. Escaping Markers

If your raw content actually contains the strings `@_` or `_@` (for example, in a tutorial about SomMark), you can escape them to prevent the parser from closing the block prematurely.

```r
@_tutorial_@;
  To start an At-Block, use \@_ followed by the ID.
  To end it, use \_@end\_@.
@_end_@
```

---

