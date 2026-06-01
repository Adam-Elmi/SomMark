# Props (Properties)

In SomMark, metadata passed to a block is called a **Prop** (Property).

---

### How It Maps:

```ini
# Template Input:
[card = title: "Welcome", theme: "dark"] Hello [end]

# Conceptually maps to a JS component call:
render({
  args: { title: "Welcome", theme: "dark" }, // Passed under 'args' in the current major version
  content: "Hello"
})
```

> [!NOTE]
> **Compatibility**: To preserve backward compatibility with the current major version of SomMark, the core engine passes these properties under the **`args`** key in your custom JavaScript `render` functions. This property will be renamed from `args` to `props` in the next major version.

---

## 1. Syntax Overview

Props always follow an `=` sign in a block header and are separated by commas.

```ini
[identifier = prop1, prop2, key: value]
```

### Two Types of Props
1.  **Positional**: Just the value (e.g., `"container"`).
2.  **Named**: `key: value` pair (e.g., `color: "red"`).

> [!IMPORTANT]
> **Always use quotes** for your values. While unquoted values (like `color: red`) still work for simple text, quotes are required for values with spaces and ensure your code is future-proof.

```ini
# "container" is positional (index 0)
# "center-content" is positional (index 1)
# color: "red" is named
[div = "container", "center-content", color: "red"] ... [end]
```

---

## 2. Global Indexing Strategy

Every prop (whether named or positional) is assigned a **Numerical Index** based on its position in the list.

```ini
[tag = "A", key: "B", "C"]
```
*   `args["0"]` → `"A"`
*   `args["1"]` → `"B"`
*   `args["2"]` → `"C"`

---

## 3. Prop Keys

Keys are the names used in **Named Props**.

### Unquoted Keys (Allowed Characters)
Standard, unquoted keys are strictly validated and can **only** contain:
* **Alphanumeric:** `a-z`, `A-Z`, `0-9`
* **Symbols:** Hyphens `-`, Underscores `_`, and Dollar signs `$`

> [!WARNING]
> Colons (`:`) are **forbidden** inside unquoted keys. Because the colon acts as the key-value separator, writing an unquoted key with a colon (like `theme:color`) will cause the parser to treat the first part (`theme`) as the key and the second part (`color`) as the value.

```ini
[tag = my-class: "main", id$101: "active"][end]
```

### Quoted Keys
If your key needs characters outside the allowed unquoted set (such as spaces, brackets, or commas), you **must** wrap it in single or double quotes.
```ini
[tag = "data type": "user", "border,color": "red"][end]
```

---

## 4. Prop Values

Values can be passed as quoted strings (recommended) or unquoted strings (for backwards compatibility).

### Unquoted Values (Allowed Characters)
Unquoted values are read as literal strings up to the first structural delimiter or whitespace. They can contain any character **except**:
* **Brackets & Braces:** `[`, `]`, `(`, `)`, `{`, `}`
* **Structural Delimiters:** `:`, `=`, `,`, `;`, `!`
* **Quotes & Comments:** `"`, `'`, `#`, `@`
* **Whitespace:** Spaces, tabs, and newlines
* **Escapes:** Backslash `\`

```ini
[tag = active, path: /usr/local/bin, ratio: 50% !]
```
> [!WARNING]
> Because spaces and commas act as structural separators, values containing these symbols **must** be quoted (e.g. `name: "Adam Elmi"`).

### Quoted Values (Recommended)
Text wrapped in `"` or `'`. Quotes are the **gold standard** for SomMark props. They protect your data and allow for spaces, commas, and colons without escaping.
```ini
[link = title: "Visit SomMark, the best engine" !]
```

---

## 5. Element Support

| Element Type | Prop Support |
| :--- | :--- |
| **Blocks** `[ ]` | Full support (Positional & Named) |
| **At-Blocks** `@_ _@` | Full support (Positional & Named) |
| **Inlines** `( )->( )` | Full support (Positional & Named) |

---

## 6. Advanced Injection

Props can resolve dynamic data using **Prefix Layers**:

- **`v{variable}`**: Local component props.
- **`p{placeholder}`**: Global configuration values.
- **`js{data}`**: Native JavaScript Objects, Arrays, and Numbers.
- **`static ${/* js code */}$`**: Compile-time JavaScript code.

```ini
[Profile = id: v{userId}, roles: js{["admin", "editor"]}, theme: p{theme}, year: static${new Date().getFullYear()}$ !]
```
