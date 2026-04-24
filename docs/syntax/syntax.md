# SomMark Syntax Guide

SomMark is a simple and clear way to structure your content. It uses a very clean system of Blocks, Inlines, and At-Blocks.

## 1. Core Principles

- **Everything fits everywhere**: You can put Text, Blocks, Inlines, and At-Blocks anywhere in your document.
- **Pure Logic**: Every piece of content is turned into a complete "Tree Structure" (AST). This ensures your output is always predictable and safe.

## 2. The Five Main Parts

There are five simple ways to write in SomMark:

### Text
Regular writing without any special markers.

**Example:**
```ini
Hello, this is just a normal sentence.
```

### Blocks
Blocks are used for sections, headers, and containers. They can hold other blocks inside them.

**Without Arguments (Simple):**
```ini
[identifier]
  Content goes here...
[end]
```

**With Arguments (Advanced):**
Arguments follow an equals sign (`=`) and are separated by commas.
```ini
[identifier = value1, key: value2]
  Content...
[end]
```

**Positional vs Named Arguments:**
SomMark supports two ways to pass data:
1.  **Positional**: Values passed simply by their order (e.g., `"val1"`).
2.  **Named**: Values passed with a specific key (e.g., `color: "red"`).

*Note: All positional arguments are assigned a number (starting at 0), allowing developers to access them easily.*

**Examples:**
```ini
# A simple header
[h1]Welcome to My Site[end]

# A div with positional and named arguments
[div = "container", style: "color: red"]
  [p]This is a paragraph inside a div.[end]
[end]
```

### Inline
Inlines are used for small changes within a sentence (like bold text or links). They are designed for speed and formatting.

**Syntax:**
```ini
(content)->(identifier)
(content)->(identifier: arg1, arg2)
```

**Rules for Inlines:**
1.  **No Nesting**: Inlines do **not** allow other SomMark tags (Blocks or other Inlines) inside their content.
2.  **Raw Text**: Everything inside the first pair of parentheses is treated as raw text.
3.  **Balanced Parentheses**: While you can't nest tags, you **can** include balanced parentheses (e.g., for code snippets).

**Examples:**
```ini
# Without arguments
This is (very important)->(bold).

# With arguments
Visit (our website)->(link: "https://sommark.org").

# Balanced parentheses (Nested parens)
Check this (console.log("Hello"))->(code).
```

### At-Blocks (@)
At-Blocks are used for specific content like code snippets or raw data. They do not parse anything inside them.

**Syntax:**
```ini
# Header must end with a semicolon (;)
@_identifier_@: arg1, key: value;
  Raw content here...
@_end_@
```

### Comments (#)
Comments are personal notes. They are hidden from the final output by default.

**Syntax:**
```ini
# This is a secret note for myself
```

## 3. Smarter Features

### Double-Quote & Single-Quote Support
You can use either `" "` or `' '` for your values. This is very helpful when you need to use a single type of quote inside your text.

### Prefix Layers (`p{...}` and `js{...}`)

- **`p{keyword}`**: Automatically inserts text values you defined in your settings. Valid in text and headers.
- **`js{data}`**: Passes native JavaScript data (numbers, arrays, objects) into your blocks. Valid **only** inside block headers.

## 4. Escaping Symbols

If you want to use a special symbol (like `[` or `#`) as normal text, put a backslash (`\`) in front of it.

**Examples:**
- `\[` -> `[`
- `\#` -> `#`
- `\@` -> `@`

---

## 5. Complete Real-World Example

```ini
[h1]Welcome to p{userName}[end]

# This is a helpful tip
[div = class: "intro"]
  We are happy to have you here at (SomMark)->(css:"font-weight: bold").
  [p]Check out our newest code update:[end]
[end]

@_code_@: lang: "js";
  const message = "Ready for V4!";
  console.log(message);
@_end_@
```
