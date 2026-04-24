# escapeHTML

The `escapeHTML` method is a utility helper that makes a raw string safe to display in HTML by replacing special characters with their corresponding HTML entities.

**Syntax:** `this.escapeHTML(string)` (within a mapper)

---

## 1. Character Mapping

The method performs the following transformations:

| Character | Entity |
| :--- | :--- |
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&#39;` |

---

## 2. Basic Example

```js
const raw = '<h1> "Smark" & SomMark </h1>';
const safe = this.escapeHTML(raw);

console.log(safe);
// Output: &lt;h1&gt; &quot;Smark&quot; &amp; SomMark &lt;/h1&gt;
```

---

## 3. Usage inside Mappers

Mappers typically use this method to ensure that user content doesn't break the generated HTML structure.

```js
HTML.register("span", function({ content }) {
    // Manually escaping content before wrapping in tags
    const safeContent = this.escapeHTML(content);
    return this.tag("span").body(safeContent);
});
```

> [!NOTE]
> If a tag is registered with `{ escape: true }` in its options (the default), the SomMark engine will automatically call this method on the content before passing it to the renderer.
