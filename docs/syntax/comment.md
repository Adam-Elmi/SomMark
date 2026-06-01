# Comments

Comments allow you to leave notes, TODOs, or internal explanations within your SomMark files without them appearing in the final output.

---

## 1. Universal Lexer Scope

The most important rule of SomMark comments is that they work **everywhere**. Because comments are handled at the Lexer level, you can place them in paragraphs, inside Block headers, or between arguments.

```re
# This is a standalone comment
[div # This comment is inside a header
  class: "active" # Comment after an argument
]
  Hello World
[end]
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

SomMark 4.1.0+ supports multiline comments for longer explanations or for "commenting out" large sections of code.

*   **Syntax**: Wrapped in `###` markers.
*   **Behavior**: Everything between the markers is ignored.

```re
###
  This is a multiline comment.
  It can span many lines and even 
  include other [blocks] and tags.
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

## 5. Disabling Comments

If you need to process raw text that contains many hashes (like a shell script), use an **At-Block**. At-Blocks do not parse comments inside their body.

```re
@_bash_@;
  # This # will # not # be # a # comment
  echo "Hello"
@_end_@
```
