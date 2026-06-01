# includesId()

Checks if the mapper has at least one of the specified tag IDs registered. Returns `true` or `false`.

---

**Syntax:**
```js
mapper.includesId(ids);
```

**Usage:**
```js
import { MARKDOWN } from "sommark";
const mapper = MARKDOWN.clone();
const hasBold = mapper.includesId(["bold", "b"]);
console.log(hasBold); // true
```

---

### Key Behaviors

* **Case-Sensitive**: Checks are case-sensitive. Querying `["BOLD"]` will not find a tag registered as `"bold"`.
* **Checks Multiple Tags**: Returns `true` if **at least one** of the tag names in the array is registered.
* **Checks Aliases**: Correctly resolves tags registered with multiple names (like `["b", "bold"]`).
* **Requires an Array**: The `ids` argument **must** be an array (e.g., `["button"]`). Passing a string (like `"button"`) will return `false` on a standard Mapper, and will **throw a runtime error** inside the template sandbox logic (`SomMark.includesId()`).
* **Fast Performance**: Uses a high-performance `Set` internally. Perfect for quick checks where you don't need the tag object.

---

### Example: Basic Tag Check

You can pass an array of tag names to verify if the mapper supports them:

```javascript
import { MARKDOWN } from "sommark";

// 1. Check if the Markdown mapper supports "bold" or "b"
const hasBold = MARKDOWN.includesId(["bold", "b"]);
console.log(hasBold); // true

// 2. Case-sensitivity test: "BOLD" is not registered in uppercase
const hasBoldUpper = MARKDOWN.includesId(["BOLD"]);
console.log(hasBoldUpper); // false
```

---

### Example: Using it with conditionals

Use `.includesId()` to easily check features before transpiling content:

```javascript
import SomMark, { HTML } from "sommark";

const customMapper = HTML.clone();
customMapper.clear(); // Clears all tags

const src = "This has a [card]Buy a ticket![end] tag.";

// Check if the "card" tag is supported in this mapper
if (customMapper.includesId(["card"])) {
  console.log(await SomMark.transpile({ src, format: "html", mapperFile: customMapper }));
} else {
  console.log("Error: This mapper does not has the 'card' tag registered!");
}
// Output: Error: This mapper does not has the 'card' tag registered!
```

[Read get.md to retrieve the actual tag object](get.md)
[Read clear.md to see how clearing tags affects includesId](clear.md)
