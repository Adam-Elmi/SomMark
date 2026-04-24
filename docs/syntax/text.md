# Plain Text and Paragraphs

SomMark treats everything that isn't a structural marker (Block, At-Block, Inline, or Comment) as **Plain Text**. This data is captured by the Lexer and organized into logical units by the Parser.

---

## 1. Paragraph Organization

The Parser groups continuous lines of text into **Paragraphs**.

*   **Splitting**: A paragraph is terminated by a **Double Newline** (`\n\n`) or the appearance of a structural block (like `[div]`).
*   **Continuation**: Single newlines are preserved but do not break the current paragraph node in the AST.

```ini
This is one paragraph.
It continues here.

This is a second paragraph.
```

---

## 2. Indentation Depth

Each line of text in SomMark tracks its **Depth** (the number of leading spaces). This metadata is stored in the AST and can be used by mappers to handle nested lists, indentation offsets, or code blocks.

```ini
Standard text (Depth: 0)
  Indented text (Depth: 2)
    Deep text (Depth: 4)
```

---

## 3. Whitespace & Junk Handling

SomMark handles whitespace differently depending on the **Context**:

### I. Text Context (Body)
In the body of a document, SomMark has **Strict Preservation**. Every space and every single newline is preserved exactly as written.

### II. Header Context
Inside the `[...]` or `(...)` of a tag, whitespace is treated as **Structural Junk**. It is ignored by the parser, allows for multi-line headers, and and does not appear in the final output.

```ini
[
  div 
  class: "flex"
]
  Content...
[end]
```

---

## 4. Characters & Escaping

Characters like `[` , `(` , `@` , and `#` have functional roles. To render them as literal text, you must use a backslash.

*   `\[` → `[`
*   `\(` → `(`
*   `\@_` → `@_`
*   `\#` → `#`

> [!TIP]
> Use **At-Blocks** for content with heavy symbol usage. They effectively "mute" the parser's structural detection for everything except the closing tag.
