# clone

The `clone` method creates a deep copy of the mapper instance. This is useful when you want to create a new mapper based on an existing one but want to ensure that changes to the copy do not affect the original.

**Syntax:** `mapper.clone()`

---

## 1. How it Works

*   **Deep Copy**: The method copies all internal properties, including the `outputs` registry and the `options` object.
*   **Isolation**: Because it creates a new instance with its own unique arrays and sets, you can add or remove tags from the clone without modifying the source mapper.
*   **Property Transfer**: All custom properties and methods attached to the mapper are preserved in the new instance.

---

## 2. Real Example: Creating a Restricted Mapper

Use `clone` to create a "Safe" version of a standard mapper by removing potentially dangerous tags.

```js
import { HTML } from "sommark";

// 1. Create an independent copy of the HTML mapper
const safeHTML = HTML.get("div") ? HTML.clone() : HTML.clone(); // Generic clone

// 2. Modify the clone only
safeHTML.removeOutput("script");
safeHTML.removeOutput("style");

// Result:
// HTML still has 'script' support.
// safeHTML will treat 'script' as an unknown tag or plain text.
```

---

## 3. Use Case: Contextual Overrides

You can clone a mapper to apply specific options that only apply to a single segment of your documentation.

```js
import { MARKDOWN } from "sommark";

const liteMarkdown = MARKDOWN.clone();

// Change options on the clone only
liteMarkdown.options.trimAndWrapBlocks = true;

// Original MARKDOWN remains untouched
```

---

> [!TIP]
> Use **`clone()`** instead of simple assignment (`const b = a`) to avoid shared state bugs where modifying one mapper accidentally breaks another.
