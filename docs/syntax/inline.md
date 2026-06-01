# Inline Statements

Inline Statements are used to style, format, or apply functional behaviors to small spans of text inside paragraphs (such as making text bold, colored, or rendering links).

---

The core syntax is `(content)->(identifier = props)` or the alternative `(content)->(identifier: props)`. Because they are inline, the parser automatically collapses internal newlines and duplicate spaces into a single space.

> [!NOTE]
> Supporting the `=` syntax provides visual clarity by explicitly differentiating the **identifier/tag name** from its **props**, avoiding colon confusion when keys inside the prop list also use colons. The old colon-based style (`:`) remains fully supported for backward compatibility.

### Basic Styling
```ini
This is (very important)->(bold) text.
```

### With Props (Positional & Named)
```ini
# Recommended (consistent with Block syntax)
(Click here)->(link = "https://sommark.org", target: "_blank")

# Alternative (Colon separator)
(Click here)->(link: "https://sommark.org", target: "_blank")
```

### Multiline Inlines
You can spread long inlines across multiple lines for better readability.
```ini
(
  Visit our updated 
  project website
) 
-> 
(link = "https://sommark.org")
```

---

## 2. Rendering Outputs

### HTML Format
* **Smark Input:**
  ```ini
  This is (important)->(bold).
  ```
* **Rendered Output:**
  ```html
  This is <strong>important</strong>.
  ```

### MDX Format
* **Smark Input:**
  ```ini
  (View Profile)->(Link: href: "/profile", class: "btn")
  ```
* **Rendered Output:**
  ```jsx
  <Link href="/profile" className="btn">View Profile</Link>
  ```

---

## 3. Core Principles

### I. Raw Text Only (No Rendered Nesting)
Everything inside the content parentheses is treated as literal plain text. You cannot produce nested HTML tags using nested inline statements.
> [!IMPORTANT]
> Because inline content is treated as raw text, writing `((hello)->(bold))->(link)` will treat `(hello)->(bold)` as raw plain text inside the outer `link` tag rather than rendering a bold tag inside a link. If you need rich nested HTML elements, use [Blocks](block.md) instead.

### II. Balanced Parentheses Support
While you cannot nest other *tags*, you **can** include balanced parentheses in the content (great for code snippets).
```ini
(console.log("Hello"))->(code)
```

---

## 4. Safety & Escaping

### Parentheses Fallback
Parentheses that do not match the `(...) -> (...)` pattern are treated as standard literal text without throwing errors.
```ini
I wrote a note (this is just normal text, not an inline tag).
```

### Escaping the Arrow
If you need a literal `->` arrow inside your content, escape it with a backslash (`\->`).
```ini
(The function uses the \-> operator.)->(code)
```


