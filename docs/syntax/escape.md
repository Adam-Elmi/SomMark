# Escaping

**Escaping** is the mechanism used to turn SomMark's structural symbols into literal text. By placing a backslash (`\`) before a character, you tell the engine to "ignore" its functional meaning.

## 1. Structural Symbol Map

The following symbols must be escaped if you wish to use them as plain text:

| Category | Symbols | Escape |
| :--- | :--- | :--- |
| **Blocks** | `[` , `]` , `[end]` | `\[` , `\]` , `\[end]` |
| **Inlines** | `(` , `)` , `->` | `\(` , `\)` , `\->` |
| **At-Blocks** | `@_` , `_@` | `\@_` , `\_@` |
| **Layers** | `p{` , `js{` | `\p{` , `\js{` |
| **Comments** | `#` | `\#` |
| **Arguments** | `:` , `,` , `=` | `\:` , `\,` , `\=` |

> [!CAUTION]
> **Do not escape keys.** Escaping a structural character inside a key name (e.g., `k\:ey: value`) will cause a **Parser Error**. If a key requires special characters, you must wrap the entire key in quotes instead: `"k:ey": value`.

---

## 2. The Backslash Rule

In SomMark V4, the backslash is a **Contextual Gatekeeper**. 

*   **Valid Escapes**: A backslash followed by a non-whitespace character is valid.
*   **Literal Backslash**: To produce a literal `\` in your output, you must use `\\`.
*   **Invalid Escapes**: Using a backslash followed by whitespace or at the very end of a file will trigger a **Lexer Error**.

> [!WARNING]
> Do not use trailing backslashes at the end of a line; the engine expects a character immediately following the `\`.

---

## 3. Escaping in Different Contexts

### I. Inside Paragraphs (Body Text)
The most common use of escaping is to prevent the engine from starting a new Block or Inline while you are writing.

#### Smart Parentheses
In SomMark V4, you **do not** need to escape a lone parenthesis `(`. The lexer only treats `(` as a structural symbol if it is followed by a matching `)` and a `->` arrow.

```ini
This (is safe) and does not need escaping.
However, \(this)->(link) must be escaped to remain literal text.
```

### II. Inside Argument Headers
When passing unquoted values, you must escape the separators that help the parser define keys and values.

```ini
# The colon here would normally split the argument
[tag = ratio: 16\:9, color: "blue"][end]
```

### III. Inside At-Block Bodies
At-Blocks are designed for raw content, but if your content contains the string `_@` (which ends the block), you must escape it to keep the block open.

```ini
@_tutorial_@;
  The closing tag for an At-Block is \_@end\_@.
@_end_@
```

---

## 4. When is Escaping NOT needed?

You can avoid manual escaping using two methods:

1.  **Quoted Keys & Values (Header Only)**: Within headers, wrapping either a **Key** or a **Value** in `" "` or `' '` protects structural symbols (like `:` or `,`) from being parsed. In the body text, quotes provide no protection.
2.  **At-Blocks**: For large snippets of code or configuration, wrapping the entire block in `@_code_@; ... @_end_@` is faster and cleaner than escaping every symbol.

---


