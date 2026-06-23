# Props (Properties)

In SomMark, metadata passed to a block is called a **Prop** (Property).

---

### How It Maps:

```ini
# Template Input:
[card = title: "Welcome", theme: "dark"] Hello [end]

# Conceptually maps to a JS component call:
render({
  props: { title: "Welcome", theme: "dark" },
  content: "Hello"
})
```

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
[id = "A", key: "B", "C"]
```
*   `props["0"]` → `"A"`
*   `props["1"]` → `"B"`
*   `props["2"]` → `"C"`

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
[id = my-class: "main", id$101: "active"][end]
```

### Quoted Keys
If your key needs characters outside the allowed unquoted set (such as spaces, brackets, or commas), you **must** wrap it in single or double quotes.
```ini
[id = "data type": "user", "border,color": "red"][end]
```

---

## 4. Prop Values

Values can be passed as quoted strings (recommended) or unquoted strings (for backwards compatibility).

### Unquoted Values (Allowed Characters)
Unquoted values are read as literal strings up to the first structural delimiter or whitespace. They can contain any character **except**:
* **Brackets & Braces:** `[`, `]`, `{`, `}`
* **Structural Delimiters:** `:`, `=`, `,`, `;`, `!`
* **Quotes & Comments:** `"`, `'`, `#`
* **Whitespace:** Spaces, tabs, and newlines
* **Escapes:** Backslash `\`

```ini
[id = active, path: /usr/local/bin, ratio: 50% !]
```
> [!WARNING]
> Because spaces and commas act as structural separators, values containing these symbols **must** be quoted (e.g. `name: "Adam Elmi"`).

### Quoted Values (Recommended)
Text wrapped in `"` or `'`. Quotes are the **gold standard** for SomMark props. They protect your data and allow for spaces, commas, and colons without escaping.
```ini
[link = title: "Visit SomMark, the best engine" !]
```

---

## 5. Advanced Injection

Props can carry dynamic data using these special value types:

- **`v{variable}`**: A value from the current component or loop.
- **`p{placeholder}`**: A value from the global compile config.
- **`${ js code }$`**: Runs JavaScript at build time and uses the result. The `static` keyword is optional.

```ini
[Profile = id: v{userId}, theme: p{theme}, year: ${ new Date().getFullYear() }$ !]
```
