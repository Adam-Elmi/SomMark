# get()

Retrieves a registered tag object (`{ id, render, options }`) from the mapper.

---

**Syntax**:

```javascript
mapper.get(id);
```

**Usage**:
```js
import { MARKDOWN } from "sommark";
const mapper = MARKDOWN.clone();
const boldTag = mapper.get("bold");
console.log(boldTag.id); // "bold"
console.log(boldTag.options); // { type: ["Block", "Inline"] }
console.log(boldTag.render); // function
```

---

### Key Behaviors

* **Case-Insensitive**: Tag names are not case-sensitive. Calling `.get("BOLD")` or `.get("bold")` returns the same tag.
* **Handles Multiple Names (Aliases)**: If a tag has multiple names (like `["b", "bold"]`), calling `.get("b")` or `.get("bold")` returns the same tag.
* **Last Match Wins**: Searches the registered list backwards. If multiple tags share the same name, it returns the one added most recently.
* **Returns `null` if Missing**: Returns `null` if the tag has not been explicitly registered in the mapper.

---

### Example: Copying Tags Between Mappers

You can use `.get()` to copy a tag rule from one mapper to another:

```javascript
import { Mapper, MARKDOWN } from "sommark";

const customMapper = new Mapper();

// 1. Get the bold tag from the Markdown mapper
const boldRule = MARKDOWN.get("bold");

if (boldRule) {
  // 2. Register it directly into your own custom mapper
  customMapper.register("bold", boldRule.render, boldRule.options);
}
```

---

### Example: Registered Tags vs Fallback Tags

The HTML mapper handles common elements (like `div`) dynamically. Since they are not explicitly registered in the mapper, `.get()` returns `null`:

```javascript
import { HTML } from "sommark";

// 1. "css" is explicitly registered, so get() returns the tag object
const cssTag = HTML.get("css");
console.log(cssTag.id); // "css"

// 2. "div" is not explicitly registered (handled by fallback), so get() returns null
const divTag = HTML.get("div");
console.log(divTag); // null
```

[Read includesId.md to check if a tag is registered without returning the object](includesId.md)

[Read getUnknownTag.md to understand fallback tags](getUnknownTag.md)
