# Comments

Comments allow you to leave notes, TODOs, or internal explanations within your SomMark files without them appearing in the final output.

---

## 1. Universal Lexer Scope

The most important rule of SomMark comments is that they work **everywhere**. Because comments are handled at the Lexer level, you can place them in paragraphs, inside Block headers, or between arguments.

```re
# This is a standalone comment
[div # The block name
  class: "active" # Comment after an argument
]
  Hello World
[end:div]
```

---

## 2. Single-Line Comments `#`

*   **Indicator**: Starts with the `#` symbol.
*   **Termination**: Ends at the end of the current line (newline).

```re
# This is a quick note
[p]Hello World[end] # Another note
```

---

## 3. Multiline Comments `###`

SomMark supports multiline comments for longer explanations or for temporarily disabling large sections of code.

*   **Syntax**: Wrapped in `###` markers.
*   **Behavior**: Everything between the markers is ignored.

```re
###
  This is a multiline comment.
  It can span many lines and even 
  include other [blocks] and syntax.
###
```

---

## 4. Protecting the Hash Symbol

If you need to use a `#` as literal text, you have two options depending on context:

### I. Escaping
In the body text or unquoted argument values, use a backslash:
```re
The color code is \#FF0000.
```

### II. Quoting (Headers Only)
Inside a header, you can wrap the value in quotes to protect the `#`:
```re
[style = color: "#FF0000"][end]
```

---

## 5. Using a Literal `#` Character

To include a `#` as literal text (not a comment), escape it with a backslash. This works in body text and inside unquoted prop values.

```re
The color code is \#FF0000.
```

Inside a block header, wrap the value in quotes instead:

```re
[style = color: "#FF0000"][end]
```

See [Escaping](escape.md) for the full list of characters that need escaping.
