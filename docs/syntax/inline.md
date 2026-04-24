# Inline Statements

**Inline Statements** are used specifically to **style or format** small parts of your text, like making a word bold, colored, or a link.

Think of them as "Formatting Pieces" that live inside sentences. Because they are designed to flow perfectly with your text, the engine automatically **strips all newlines** and collapses them into a single space, ensuring your paragraph remains a single, unbroken block.

## 1. Core Syntax

The basic structure of an inline statement is a pair of parentheses for **content**, followed by an arrow `->`, and another pair of parentheses for the **identifier**.

```ini
This is (very important)->(bold).
```

### Flexible Formatting
In SomMark V4, inline statements are **whitespace-agnostic**. You can spread them across multiple lines to improve readability without breaking the engine.

```ini
(
  Visit our updated 
  project website
) 
-> 
(link: "https://sommark.org")
```

---

## 2. Key Principles

To maintain maximum performance and predictability, Inlines follow these three rules:

### I. Raw Text Only
Everything inside the content parentheses is treated as **literal text**. The parser does not look for other tags (Blocks, At-Blocks, or other Inlines) inside an inline.

> [!IMPORTANT]
> Because inlines are "Raw Only", you cannot nest a bold tag inside a link tag using inline syntax. Use Blocks if you need hierarchical nesting.

### II. Balanced Parentheses
While you cannot nest other *tags*, you **can** include balanced parentheses within the content. This is perfect for code snippets.

```ini
(console.log("Hello World"))->(code)
```
*The parser intelligently tracks the depth to find the correct closing parenthesis.*

### III. Automatic Whitespace Collapsing
To ensure your document flows correctly, the engine automatically collapses all newlines and multiple spaces inside an inline into a **single space**.

---

## 3. Arguments & Metadata

Inlines support **positional arguments** passed via a colon `:` after the identifier.

```ini
(Click here)->(link: "https://google.com", "_blank")
```

> [!WARNING]
> Unlike Blocks, Inline Statements **do not support named arguments** (e.g., `target: "_blank"`). Arguments must be passed in the order defined by the mapper.

---

## 4. Safety & Escaping

### Fallback Behavior
If the parser sees parentheses that do not follow the `(...) -> (...)` pattern, it safely falls back to treating them as normal text.

```ini
I wrote a note (this is just normal text, not an inline).
```

### Escaping the Arrow
If you need a literal `->` arrow inside your content, you should escape it with a backslash or ensure your parentheses are balanced.

```ini
(
  The function uses the \-> operator.
)->(code)
```

---

