# Escaping

Escaping transforms functional, structural symbols in SomMark into literal text. Prepend a backslash (`\`) before a character to instruct the parser to ignore its functional meaning.

---

## 1. Structural Symbol Map

The following symbols must be escaped to render as plain text:

| Category | Structural Symbols | Escape Syntax |
| :--- | :--- | :--- |
| **Blocks** | `[`, `]`, `[end]` | `\[`, `\]`, `\[end]` |
| **Inlines** | `(`, `)`, `->` | `\(`, `\)`, `\->` |
| **At-Blocks** | `@_`, `_@` | `\@_`, `\_@` |
| **Layers** | `p{`, `v{`, `js{` | `\p{`, `\v{`, `\js{` |
| **Logic Blocks** | `static ${`, `runtime ${` | `\static ${`, `\runtime ${` |
| **Comments** | `#` | `\#` |
| **Arguments** | `:`, `,`, `=` | `\:`, `\,`, `\=` |

> [!CAUTION]
> **Do not escape unquoted keys.** Escaping a structural character inside an unquoted key name (e.g. `k\:ey: value`) triggers a **Parser Error**. If a key requires a colon or special symbol, wrap the key in quotes (e.g. `"k:ey": value`).

---

## 2. The Backslash Rule

Backslashes are parsed contextually according to these structural rules:

* **Valid Escapes:** A backslash followed immediately by any non-whitespace character.
* **Literal Backslash:** To render a literal `\` in your output, write `\\`.
* **Invalid Escapes:** A backslash followed by a space, tab, newline, or placed at the very end of a file triggers a **Lexer Error**.

> [!WARNING]
> Never use trailing backslashes at the end of a line; the engine expects an escaping target immediately after the backslash character.

---

## 3. Escaping in Context

### I. Inside Paragraphs (Body Text)
Escaping prevents the parser from executing blocks or inlines inside standard prose.
```ini
This (is safe) and does not need escaping since it lacks a trailing arrow.
However, \(this)->(link) must be escaped to prevent compiling as an inline.
```

### II. Inside Argument Headers
When passing unquoted argument values, escape any active separators to prevent incorrect argument parsing.
```ini
# The colon inside the ratio must be escaped to avoid splitting key-value pairs
[tag = ratio: 16\:9, color: "blue"][end]
```

### III. Inside At-Block Bodies
At-Block bodies are raw, but if they contain the `_@` closing sequence, you must escape it to prevent premature closing of the block.
```ini
@_tutorial_@;
  The closing tag for an At-Block is \_@end\_@.
@_end_@
```

---

## 4. Avoiding Escapes

You can avoid manual escaping using these native mechanisms:

1. **Quoted Keys & Values (Headers only):** Wrapping arguments inside `" "` or `' '` protects colons, commas, and spaces from being parsed as separators.
2. **At-Blocks:** For large blocks of code or config files, use At-Blocks (`@_code_@; ... @_end_@`) to disable parser scanning inside the block completely.



