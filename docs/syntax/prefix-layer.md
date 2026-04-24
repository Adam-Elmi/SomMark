# Prefix Layers (Variables & Data)

**Prefix Layers** are special "bridge" symbols that allow you to inject data and dynamic information into your static SomMark files. They act as placeholders and data transporters, connecting your templates to your application's data.

There are two primary layers in SomMark V4:
1.  **Placeholder Layer (`p{}`)**: Used for simple text replacement (usernames, site names, etc.).
2.  **JavaScript Data Layer (`js{}`)**: Used for passing structured data (Arrays, Objects, Numbers, Booleans, Strings) to your components.

> [!IMPORTANT]
> **Data, Not Logic**: Prefix layers are **not** script tags. They cannot perform math (like `1+1`), comparisons (like `1>0`), or run functions. They are designed for **safe data injection only**.

---

## 1. The Placeholder Layer (`p{key}`)

The Placeholder Layer is the most common tool for dynamic content. It looks for a "key" in your application's configuration and swaps it out for a string.

*   **Syntax**: `p{key_name}`
*   **Resolution**: Replaces itself with a string value.
*   **Context**: Works everywhere (Body text and Argument Headers).

### Example
```r
# In body text
Welcome to p{siteName}!

# In arguments
[h1 = title: p{pageTitle}][end]
```

---

## 2. The JavaScript Layer (`js{data}`)

The JavaScript Data Layer is used when you need to pass more than just text. It is essential for complex components (like image galleries or user profiles) that require lists or key-value structures.

*   **Syntax**: `js{data_structure}`
*   **Resolution**: Passes native JavaScript types (Arrays, Objects, Booleans, Numbers) into the AST.
*   **Scope**: **Headers Only**. It is not recognized in plain body text.

### Supported Data Types
```re
# Passing a number
[div = width: js{ 1024 }][end]

# Passing an array
[Gallery = images: js{ ["1.jpg", "2.jpg"] }][end]

# Passing an object
[Profile = info: js{ {id: 101, admin: true} }][end]
```

---

## 3. Comparison Summary

| Feature | `p{...}` (Placeholder) | `js{...}` (Data Layer) |
| :--- | :--- | :--- |
| **Primary Use** | Simple text/string variables | Complex developer data types |
| **Output Type** | Always a String | Array, Object, Boolean, Number |
| **Context** | Anywhere in the document | Argument Headers Only |
| **Safety** | Config lookup (Safe) | Safe Data Parser (No Execution) |

---

> [!CAUTION]
> If a `js{}` structure is invalid (e.g., a missing bracket), the engine will fallback to treating it as a raw string to prevent the entire document from crashing.