# includesId()

Checks if the mapper has at least one of the specified block IDs registered. Returns `true` or `false`.

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

* **Case-Sensitive**: Checks are case-sensitive. Querying `["BOLD"]` will not find a block registered as `"bold"`.
* **Checks Multiple Blocks**: Returns `true` if **at least one** of the block names in the array is registered.
* **Checks Aliases**: Correctly resolves blocks registered with multiple names (like `["b", "bold"]`).
* **Requires an Array**: The `ids` argument **must** be an array (e.g., `["button"]`). Passing a string (like `"button"`) will return `false` on a standard Mapper, and will **throw a runtime error** inside the template sandbox logic (`SomMark.includesId()`).
* **Fast Performance**: Uses a high-performance `Set` internally. Perfect for quick checks where you don't need the block object.

---

### Example: Basic Block Check

You can pass an array of block names to verify if the mapper supports them:

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
customMapper.clear(); // Clears all blocks

const src = "This has a [card]Buy a ticket![end:card] block.";

// Check if the "card" block is supported in this mapper
if (customMapper.includesId(["card"])) {
  console.log(await SomMark.transpile({ src, format: "html", mapperFile: customMapper }));
} else {
  console.log("Error: This mapper does not have the 'card' block registered!");
}
// Output: Error: This mapper does not have the 'card' block registered!
```

[Read get.md to retrieve the actual block object](get.md)

[Read clear.md to see how clearing blocks affects includesId](clear.md)
