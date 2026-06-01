# MDX Mapping Guide

The **MDX Mapper** allows you to seamlessly mix SomMark structural markup with JSX components and ESM imports. This is perfect for building modern documentation pages or component-driven layouts in React-based frameworks like Next.js, Astro, Remix, or MDX-bundlers.

---

## 1. The Hybrid Engine

The MDX Mapper follows a **Best of Both Worlds** hybrid model:
1.  **Markdown Basics**: Core text structures (bold, italics, strike, lists, tables) are automatically converted into standard, clean Markdown.
2.  **JSX Upgrade**: Standard elements that are not native Markdown syntax (like `[div]` or `[section]`) or custom React tags (like `[Card]`) are automatically rendered as clean, JSX elements.

**SomMark Source:**
```ini
[Card = title: "Welcome"]
  This is a regular **Markdown** sentence inside a custom JSX component.
[end]
```
**MDX Output:**
```jsx
<Card title="Welcome">
  This is a regular **Markdown** sentence inside a custom JSX component.
</Card>
```

---

## 2. Unregistered Identifiers (Automatic JSX Upgrades)

If an identifier is not explicitly registered in the mapper, the MDX engine uses a high-fidelity fallback mechanism (`getUnknownTag`) to automatically compile it as a standard JSX element. You do **not** need to register every single custom component in your workspace before using it.

**SomMark Source:**
```ini
[MyCustomAlert = theme: "success", border: "1px solid green"]
  Operation completed successfully!
[end]
```
**MDX Output:**
```jsx
<MyCustomAlert theme="success" style={{border: "1px solid green"}}>
  Operation completed successfully!
</MyCustomAlert>
```

---

## 3. Registered Outputs & JSX Utilities

The MDX mapper explicitly registers several specialized tags to handle layout structure, raw imports, and inline styling. Below is the complete list of these registered outputs with syntax guidelines and examples.

### 1. `[h1]` to `[h6]` Headings
- **Type**: Block
- **Purpose**: Generates JSX-compatible headings (`<h1>` to `<h6>`) by default to preserve custom props and metadata. Passing `format: "md"` or `format: "markdown"` compiles them to standard Markdown `#` tags instead.
- **Example (JSX Default)**:
  ```ini
  [h1 = id: "main-title", className: "heading-accent"]Main Title[end]
  ```
  **Output MDX**:
  ```html
  <h1 id="main-title" className="heading-accent">Main Title</h1>
  ```
- **Example (Markdown Format)**:
  ```ini
  [h1 = format: "md"]Markdown Heading[end]
  ```
  **Output MDX**:
  ```markdown
  # Markdown Heading
  ```

### 2. `[mdx]` / `@_mdx_@` AtBlock
- **Type**: AtBlock (Unescaped)
- **Purpose**: Injects raw, unescaped MDX/JSX content directly. Perfect for ESM imports, custom layout exports, or complex JSX statements.
- **Example**:
  ```ini
  @_mdx_@;
    import { BarChart } from "@/components/BarChart";
    export const pageTitle = "Metrics Dashboard";
  @_end_@
  ```
  **Output MDX**:
  ```jsx
  import { BarChart } from "@/components/BarChart";
  export const pageTitle = "Metrics Dashboard";
  ```

### 3. `css` Span Inline
- **Type**: Inline
- **Purpose**: Renders inline span formatting with rich styles. It automatically builds a JSX-compatible `style={{ ... }}` object from positional and named styling attributes.
- **Example**:
  ```ini
  Check out this (gradient text span)->(css: "font-weight: bold", color: "orange").
  ```
  **Output MDX**:
  ```jsx
  Check out this <span style={{fontWeight: "bold", color: "orange"}}>gradient text span</span>.
  ```

### 4. `raw` AtBlock
- **Type**: AtBlock (Unescaped)
- **Purpose**: Bypasses the parser and escaping layer entirely to output raw, unescaped text or custom markup.
- **Example**:
  ```ini
  @_raw_@;
    <iframe src="https://example.com" />
  @_end_@
  ```
  **Output MDX**:
  ```html
  <iframe src="https://example.com" />
  ```

---

## 4. Professional JSX Props Formatting (`jsxProps`)

When cloning the mapper or developing custom tags, leverage the `.jsxProps(args)` builder instead of manual string formatting. It handles the nuances of JSX syntax requirements:

1.  **CamelCase Conversion**: Standardizes properties to their camelCase counterparts (e.g., `class` becomes `className`, `onclick` becomes `onClick`, and custom attributes are kebab-normalized).
2.  **JSX Expression Wrapping**: Recognizes when an argument refers to variables, objects, or arrays (using `js{{ ... }}`) and outputs standard curly braces `{}` instead of string quotes `""`.
3.  **JSX Style Objects**: Automatically converts styling attributes into clean nested React style objects (e.g., `font-size: 14px` becomes `style={{ fontSize: "14px" }}`).

**Developer Registration:**
```javascript
import { MDX } from "sommark";

const customMdx = MDX.clone();
customMdx.register("UserProfile", function({ args }) {
    return this.tag("UserProfile")
        .jsxProps(args)
        .selfClose();
});
```
**SomMark Source:**
```ini
[UserProfile = 
  name: "Sarah", 
  avatar: "avatar.png",
  roles: js{{ ["admin", "editor"] }},
  border: "1px solid blue"
][end]
```
**Output MDX**:
```jsx
<UserProfile name="Sarah" avatar="avatar.png" roles={["admin", "editor"]} style={{border: "1px solid blue"}} />
```

---

## 5. Whitespace Flexibility & Build Integrity

One of the primary benefits of using SomMark to output MDX is **Syntax Flexibility**. MDX is notoriously strict about whitespace and closing tag placements, which frequently triggers compile-time build errors. 

For instance, standard MDX will fail if Markdown text is immediately adjacent to a JSX closing boundary, or if spacing between blocks is incorrect:

**Problematic MDX (Triggers Syntax Errors):**
```mdx
<Card>
  This can crash because content is on the same line as the closing tag.</Card>
```

SomMark handles all of these structural indentation rules automatically. During transpilation, it automatically formats and inserts clean whitespace padding around the compiled tags, guaranteeing bulletproof build integrity.

**SomMark (Safe & Flexible):**
```ini
[Card] You can write your content on the same line, no problem.[end]

[Card]
  Multiline content is padded cleanly as well.
[end]
```
