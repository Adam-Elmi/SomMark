# trimAndWrapBlocks

The `trimAndWrapBlocks` option is a structural controller that ensures multiline content is organized into a safe, clean, and aligned format for languages like **MDX** and **HTML**.

---

## 1. Why it's useful: Structural Safety

Languages like MDX can fail if multiline content starts on the same line as a tag. SomMark prevents this by automatically moving multiline content onto its own lines.

**Smark Input (Problematic for MDX):**
```re
[Note]Multiline
  Content
[end]
```

**Clean Result (Safe for MDX):**
```jsx

<Note>
Multiline
  Content
</Note>

```

---

## 2. Smart Trim (Indentation Safe)

SomMark doesn't just trim everything. It uses a **Smart Structural Trim** that:
*   **Cleans Boundaries**: Removes extra empty lines at the very start and end of your content.
*   **Keeps Indentation**: Preserves all the spaces and tabs you used for alignment, so your code doesn't look "broken" or left-aligned by mistake.

---

## 3. How to use it in a Mapper

### Global Setup (Recommended for MDX/HTML)
```js
const MyMapper = Mapper.define({
    options: {
        trimAndWrapBlocks: true
    }
});
```

### Selective Setup (For specific tags)
```js
mapper.register("Note", function({ content }) {
    return this.tag("Note").body(content);
}, { 
    trimAndWrapBlocks: true 
});
```

---

## 4. Requirements

*   **Streaming Mode**: This only works when `resolve` is `false` (default).
*   **Multiline Only**: It only triggers if a tag has multiple children or contains a newline. Simple one-line tags stay compact.
