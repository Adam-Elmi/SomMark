# resolve

The `resolve` option determines how the `content` argument is handled. It allows you to choose between **Standard Placeholders** (for speed) and **Actual Data** (for manipulation).

---

## 1. The Rule of Thumb

*   **DON'T touch the string?** -> Use the default (`resolve: false`). Just return `content` exactly as it was given to you.
*   **NEED to touch the string?** -> You **MUST** set `resolve: true`. Any operation (like `trim()`, `replace()`, or `toLowerCase()`) will break the placeholder.

---

## 2. Comparison

### Standard Mode (`resolve: false`)
Use this for most of your tags/ids. It is fast and memory-efficient. You just wrap the `content` in your tags and return it.

```js
mapper.register("Wrapper", function({ content }) {
    // We are NOT touching the string, just wrapping it.
    return `<div>${content}</div>`; 
});
```

### Manipulation Mode (`resolve: true`)
Use this only when you need to "clean" or change the text inside the tag.

```js
mapper.register("CleanText", function({ content }) {
    // We ARE modifying the string (trimming it), so we need resolve: true.
    return `<span>${content.trim()}</span>`;
}, { 
    resolve: true 
});
```

---

## 3. The Danger: Placeholder Corruption

If you try to modify the content **without** `resolve: true`, you will corrupt the engine's internal placeholder token. This causes the engine to "lose" your content, leading to leaked internal IDs and broken layouts.

```js
mapper.register("Broken", function({ content }) {
    // ERROR: Modifying the placeholder!
    // Result: <div>sommarkbodyplaceholder_xyz...</div>Actual Content
    return `<div>${content.toLowerCase()}</div>`;
});
```

---

> [!IMPORTANT]
> By default, `resolve` is **`false`** to keep the engine fast and non-blocking for large documents. Only enable it when you specifically need to manipulate the `content` string.
