# removeOutput

The `removeOutput` method surgically removes a specific identifier from the mapper's registry. It is intelligent enough to handle both single-ID registrations and multi-ID aliases.

**Syntax:** `mapper.removeOutput(id)`

---

## 1. How it Works

*   **Single ID**: If a tag is registered with only one ID, the entire registration is removed.
*   **Multi-ID Aliases**: If a tag has multiple IDs (e.g., `["b", "bold"]`), calling `removeOutput("b")` will only remove `"b"` from the list. The renderer remains active for `"bold"`.
*   **Empty Sets**: If removing an alias leaves the registration with zero IDs, the entire entry is deleted from the `outputs` array.

---

## 2. Examples

### Basic Removal
```js
import { MARKDOWN } from "sommark";

// Completely remove the horizontal rule support
MARKDOWN.removeOutput("hr");
```

### Surgical Alias Removal
```js
import { MARKDOWN } from "sommark";

// MARKDOWN bold is registered as ['bold', 'b']
// We want to disable 'b' but keep 'bold'
MARKDOWN.removeOutput("b");

console.log(MARKDOWN.get("b"));    // null
console.log(MARKDOWN.get("bold")); // { id: ['bold'], ... }
```

---

## 3. Use Case: Restricting Formats

You can use `removeOutput` to create "Lite" versions of standard mappers by removing heavy or dangerous tags.

```js
import { HTML } from "sommark";

const safeHTML = HTML.clone();

// Remove potentially unsafe tags from the clone
safeHTML.removeOutput("script");
safeHTML.removeOutput("style");
safeHTML.removeOutput("head");
```

---

> [!NOTE]
> This method is automatically used by `register()` and `inherit()` to prevent duplicate IDs.