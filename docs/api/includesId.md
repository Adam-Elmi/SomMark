# includesId

The `includesId` method checks if the mapper has at least one of the specified IDs registered in its outputs. It is a fast utility for "Feature Detection" when you need to know if a mapper supports a specific set of tags.

**Syntax:** `mapper.includesId(ids)`

---

## 1. Basic Usage

The method accepts an array of strings and returns `true` if any one of those strings matches a registered ID or alias.

```js
import { MARKDOWN } from "sommark";

// Check if the mapper supports any form of bold
const hasBold = MARKDOWN.includesId(["bold", "b"]);

console.log(hasBold); // true
```

---

## 2. Technical Details

### Exact Matching
Unlike the `get()` method (which is case-insensitive), `includesId` uses a high-performance **Set** for lookups and performs exact string matching. To ensure matches, it is recommended to pass lowercase IDs if the mapper follows standard SomMark registration patterns.

### Alias Support
The method correctly handles aliased registrations. If a tag is registered as `["i", "italic"]`, calling `.includesId(["i"])` will return `true`.

---

## 3. Return Value

*   **`true`**: At least one ID in the provided array exists in the mapper's registry.
*   **`false`**: None of the provided IDs were found, or the input was invalid/empty.

---

> [!TIP]
> Use **`includesId()`** when you just need a boolean check for performance-sensitive logic. If you actually need the renderer function, use **`get()`** instead.
