# Quotes

Quotes protect data within block headers, ensuring props containing spaces, commas, colons, or other structural symbols are treated as a single literal string.

---

## 1. Scope: Props Only

> [!IMPORTANT]
> Quotes act as structural delimiters **only** inside block headers (`[ ]`), inline headers `( )->( )`, and At-blocks `@_ _@`.
> In standard body text, quotes are treated as normal literal characters.

---

## 2. Dual Quote Support

SomMark supports both double (`"`) and single (`'`) quotes. They are functionally identical and allow nesting without complex backslash escaping.

| Quote | Type | Ideal Use Case |
| :--- | :--- | :--- |
| `"` | Double | Standard string values |
| `'` | Single | Nesting double quotes or complex strings (e.g. inline styles) |

### Nesting Example (No Escaping)
```ini
[div = style: 'background: url("hero.png")', class: "container" !]
```

---

## 3. When to Use Quotes

### I. Values with Spaces
Unquoted values containing spaces are not permitted because spaces separate individual keys/props. Always wrap them in quotes.
```ini
[user = name: "Adam Elmi" !]
```

### II. Multi-line Strings
Quotes preserve all internal newlines and indentation exactly as typed inside the string.
```ini
[metadata = description: "Line 1
Line 2
Line 3" !]
```

### III. Protecting Structural Symbols
If a value contains a comma `,` or colon `:`, quoting prevents the parser from misinterpreting them as prop delimiters.
```ini
[list = items: "apple, orange, banana" !]
```

---

## 4. Escaping Inside Quotes

To use the same delimiter inside a quoted string, escape it with a backslash (`\`).

| Target Quote | Escaped Syntax | Example |
| :--- | :--- | :--- |
| Double inside Double | `\"` | `[quote = text: "He said, \"Hello!\"" !]` |
| Single inside Single | `\'` | `[quote = text: 'It\'s a beautiful day' !]` |

