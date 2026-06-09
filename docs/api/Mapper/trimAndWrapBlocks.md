# trimAndWrapBlocks

Cleans up extra empty lines at the start and end of blocks, and wraps multi-line blocks in newlines so they form a beautiful, structured, and safe layout in MDX and HTML.
---

## 1. Why it is useful: Safe & Beautiful Structure

MDX can crash or break if multi-line content starts on the same line as a tag. This option moves multi-line content onto its own new lines automatically to prevent failures.

Additionally, it organizes nested tags into a beautiful, readable hierarchy with clean vertical breaks. Without it, opening and closing tags are squeezed onto the same line as the text, which looks messy and hard to read.

**Smark Input (Breaks MDX):**
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

SomMark removes extra blank lines without breaking your formatting:
*   **Cleans Boundaries**: Removes extra empty lines at the very start and very end of your block.
*   **Keeps Indentation**: Never touches your spaces or tabs at the start of lines, keeping your code alignment safe.

---

## 3. How to use it in a Mapper

### Global Setup (For all tags)
```js
const MyMapper = Mapper.define({
    options: {
        trimAndWrapBlocks: true
    }
});
```

### Selective Setup (For a single tag)
```js
mapper.register("Note", function({ content }) {
    return this.tag("Note").body(content);
}, { 
    trimAndWrapBlocks: true 
});
```

---

## 4. Tag Override beats Global Settings

Tag settings always win. If you turn on `trimAndWrapBlocks` globally, you can still turn it off for individual tags by setting `trimAndWrapBlocks: false` when registering them.

This is perfect for tags that require exact formatting and shouldn't get extra newlines.

### Example
```js
// 1. Turn wrapping on globally
const mapper = new Mapper();
mapper.options.trimAndWrapBlocks = true;

// 2. StandardBlock automatically gets wrapped in newlines
mapper.register("StandardBlock", function({ content }) {
    return this.tag("div").body(content);
});

// 3. CustomBlock forces wrapping off to stay compact
mapper.register("CustomBlock", function({ content }) {
    return `[Custom]${content}[/Custom]`;
}, { 
  // tag settings override global settings
  // This is why CustomBlock is not wrapped in newlines
  trimAndWrapBlocks: false
});
```

---

## 5. Requirements

*   **Only when resolve is false:** This only works when `resolve` is `false` (the default setting).
*   **Only for multi-line blocks:** The engine only wraps a block if it has multiple lines or child elements. Single-line blocks stay compact.

---

[Read rules() for more info](rules.md)

[Read resolve() for more info](resolve.md)

[Read tag() for more info](tag.md)
