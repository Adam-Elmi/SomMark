# At-Blocks

At-Blocks capture raw, unparsed content. Once the parser encounters an At-Block, it stops normal parsing and collects every character literally, making it ideal for rendering code snippets, raw HTML/XML, mathematical formulas, or configuration strings.

---

## 1. Syntax

An At-Block consists of a structural header `@_identifier_@`, an optional props list, a semicolon `;` acting as a structural delimiter, the literal body content, and a closing `@_end_@` marker.

### Standard At-Block
```ini
@_code_@;
  const message = "Hello World";
  console.log(message);
@_end_@
```

### With Metadata / Props
```ini
@_code_@: lang: "javascript", theme: "dark";
  const x = 42;
@_end_@
```

### Multiline Headers
For clean styling, At-Block headers can span multiple lines. Space and comments inside headers are treated as structural junk and ignored.
```ini
@_
  code
_@:
  "language": "python",   # Quotes allowed for keys
  theme = "monokai";      # Semicolon terminates the header
def hello():
    print("Multi-line header!")
@_end_@
```

---

## 2. Rendering Outputs

### HTML / Markdown Format
* **Smark Input:**
  ```ini
  @_code_@: lang = "javascript";
    console.log("Hello");
  @_end_@
  ```
* **Rendered Output:**
  ```markdown
  ```javascript
  console.log("Hello");
  ```
  ```

### MDX Format
* **Smark Input:**
  ```ini
  @_css_@;
    .card { background: red; }
  @_end_@
  ```
* **Rendered Output:**
  ```jsx
  <style>{`.card { background: red; }`}</style>
  ```

---

## 3. Core Principles

### I. Raw Content Preservation
Standard tags (Blocks, Inlines, or At-Blocks) are not parsed inside At-Block bodies. Everything is captured 100% literally.
* No nested Blocks.
* No Inline Statements.
* No structural interpretation.

### II. Whitespace & Indentation Integrity
At-Blocks preserve all spaces, indentation offsets, and newlines exactly as written. This ensures syntax integrity for indentation-sensitive targets like Python, YAML, or raw text blocks.

### III. Safe Termination
Every At-Block must close with `@_end_@`. If a closing marker is missing, the engine will safely capture everything up to the end of the file.

---

## 4. Escaping Markers

If your raw body content must contain `@_` or `_@` sequences (such as when writing a tutorial about SomMark itself), escape them with a backslash to keep the block open.
```ini
@_tutorial_@;
  To start an At-Block, use \@_ followed by the ID.
  To end it, use \_@end\_@.
@_end_@
```