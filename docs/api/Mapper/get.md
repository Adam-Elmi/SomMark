# get()

Retrieves a registered block object (`{ id, render, options }`) from the mapper.

---

**Syntax**:

```javascript
mapper.get(id);
```

**Usage**:
```js
import { MARKDOWN } from "sommark";
const mapper = MARKDOWN.clone();
const boldBlock = mapper.get("bold");
console.log(boldBlock.id); // "bold"
console.log(boldBlock.options); // { type: ["Block", "Inline"] }
console.log(boldBlock.render); // function
```

---

### Key Behaviors

* **Case-Insensitive**: Block names are not case-sensitive. Calling `.get("BOLD")` or `.get("bold")` returns the same block.
* **Handles Multiple Names (Aliases)**: If a block has multiple names (like `["b", "bold"]`), calling `.get("b")` or `.get("bold")` returns the same block.
* **Last Match Wins**: Searches the registered list backwards. If multiple blocks share the same name, it returns the one added most recently.
* **Returns `null` if Missing**: Returns `null` if the block has not been explicitly registered in the mapper.

---

### Example: Copying Blocks Between Mappers

You can use `.get()` to copy a block rule from one mapper to another:

```javascript
import { Mapper, MARKDOWN } from "sommark";

const customMapper = new Mapper();

// 1. Get the bold block from the Markdown mapper
const boldRule = MARKDOWN.get("bold");

if (boldRule) {
  // 2. Register it directly into your own custom mapper
  customMapper.register("bold", boldRule.render, boldRule.options);
}
```

---

### Example: Registered Blocks vs Fallback Blocks

The HTML mapper handles common elements (like `div`) dynamically. Since they are not explicitly registered in the mapper, `.get()` returns `null`:

```javascript
import { HTML } from "sommark";

// 1. "css" is explicitly registered, so get() returns the block object
const cssBlock = HTML.get("css");
console.log(cssBlock.id); // "css"

// 2. "div" is not explicitly registered (handled by fallback), so get() returns null
const divBlock = HTML.get("div");
console.log(divBlock); // null
```

[Read includesId.md to check if a block is registered without returning the object](includesId.md)

[Read getUnknownTag.md to understand fallback blocks](getUnknownTag.md)
