# Escaping

Escaping transforms functional, structural symbols in SomMark into literal text. Prepend a backslash (`\`) before a character to instruct the parser to ignore its functional meaning.

---

## 1. Structural Symbol Map

The following symbols must be escaped to render as plain text:

| Category | Structural Symbols | Escape Syntax |
| :--- | :--- | :--- |
| **Blocks** | `[`, `]`, `[end]` | `\[`, `\]`, `\[end]` |
| **Layers** | `p{`, `v{` | `\p{`, `\v{` |
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

### II. Inside Argument Headers
When passing unquoted argument values, escape any active separators to prevent incorrect argument parsing.
```ini
# The colon inside the ratio must be escaped to avoid splitting key-value pairs
[id = ratio: 16\:9, color: "blue"][end]
```

---

## 4. Avoiding Escapes

**Quoted Keys & Values (Headers only):** Wrapping arguments inside `" "` or `' '` protects colons, commas, and spaces from being read as separators — no escaping needed.

```ini
[id = ratio: "16:9", tags: "apple, orange" !]
```



