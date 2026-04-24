# Quote Syntax (Delimiters)

In SomMark, **Quotes** act as protective wrappers for data within headers. They define the boundaries of keys and values, ensuring that the content is treated as a single, literal entity regardless of its complexity.

> [!IMPORTANT]
> Quotes are **only structural** (acting as delimiters) inside **Headers** (Blocks, Inlines, and At-Blocks). In the body text, quotes are treated as normal characters and provide no protection for structural symbols.

---

## 1. Dual Delimiters

SomMark V4 supports two types of quotes. They are functionally identical but allow for elegant nesting.

| Delimiter | Name | Usage |
| :--- | :--- | :--- |
| `"` | Double Quote | The standard delimiter for most values. |
| `'` | Single Quote | Ideal for nesting double quotes or complex strings. |

```ini
# Clean nesting without escaping
[div = style: 'background: url("hero.jpg")'][end]
```

---

## 2. The Power of Quoting

### I. Quoted Keys (The Shield)
As discussed in [Escaping](file:///home/adam/Projects/Smark/SomMark/docs/syntax/escape.md), you cannot escape characters inside unquoted keys. To use structural symbols (like `:` or `,`) in a key name, you **must** quote it.
```ini
# Quoted key protects the internal colon
[user = "id:primary": 12345][end]
```

### II. Multi-line Strings
Quotes in SomMark V4 are **line-aware**. A quoted value can span multiple lines, and the engine will preserve all newlines and indentation exactly as written.
```ini
[metadata = description: "This is a 
multi-line string that
preserves its shape."][end]
```

### III. Protecting Values
Quotes prevent unquoted values from being prematurely split by commas or colons.
```ini
# Without quotes, the commas would create three separate arguments
[list = items: "apple, orange, banana"][end]
```

---

## 3. Quoted vs. Unquoted

| Feature | Unquoted | Quoted |
| :--- | :--- | :--- |
| **Whitespace** | Trimmed from ends | Fully Preserved |
| **Spaces** | Allowed (internal) | Allowed (internal & ends) |
| **Newlines** | Terminate the word | Preserved |
| **Symbols** | Must be escaped (`\:`) | Protected (Literal) |

---

## 4. Escaping Inside Quotes

If you must use the **same** quote type inside a quoted string, you must escape it.

*   `\"` inside `"..."`
*   `\'` inside `'...'`
*   `\\` for a literal backslash.

```ini
[quote = author: "Steve \"The Legend\" Jobs"]
```

---

> [!TIP]
> Even if a string is quoted, you still cannot use it to "hide" a block starter `[` in the **body text**. Use `\[` for that. Quotes only protect content within the context of a **Header**.
