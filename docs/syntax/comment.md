# Comments

Comments allow you to leave notes, TODOs, or internal explanations within your SomMark files without them appearing in the final output.

---

## 1. Universal Lexer Scope

The most important rule of SomMark comments is that they work **everywhere**. Because comments are handled at the Lexer level, you can place them in paragraphs, inside Block headers, or between arguments.

```ini
# This is a standalone comment
[div # This comment is inside a header
  class: "active" # Comment after an argument
]
  Hello World
[end]
```

---

## 2. Syntax & Behavior

*   **Indicator**: A comment starts with the `#` symbol.
*   **Termination**: A comment ends at the end of the current line (newline).
*   **AST Exclusion**: Comments are stripped during the lexing phase. They do not exist in the final AST and cannot be accessed by mappers.

---

## 3. Protecting the Hash Symbol

If you need to use a `#` as literal text, you have two options depending on context:

### I. Escaping (Body & Unquoted)
In the body text or unquoted argument values, use a backslash:
```ini
The color code is \#FF0000.
```

### II. Quoting (Headers Only)
Inside a header, you can wrap the value in quotes to protect the `#`:
```ini
[style = color: "#FF0000"][end]
```

---

## 4. Disabling Comments

In most SomMark implementations, the Lexer is hard-coded to treat `#` as a comment. If you need to process raw text that contains many hashes (like a shell script), use an **At-Block**:

```ini
@_bash_@;
  # This # will # not # be # a # comment
  echo "Hello"
@_end_@
```

---

> [!IMPORTANT]
> Comments are **not** minification tools. They are completely removed from the stream before the parser even sees them.
