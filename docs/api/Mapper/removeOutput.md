# removeOutput()

Removes a specific identifier (block name or alias) from the mapper's registered outputs.

---

**Syntax:**
```js
mapper.removeOutput(id)
```

**Usage:**
```js
import { MARKDOWN } from "sommark";
const mapper = MARKDOWN.clone();

// Removes horizontal rule [hr] block from registered blocks
mapper.removeOutput("hr");
```

---

### Example: Surgical Alias Removal

If a block is registered with multiple aliases (e.g., `["bold", "b"]`), removing one alias keeps the remaining ones active:

```js
import { MARKDOWN } from "sommark";
const mapper = MARKDOWN.clone();

// Disables the 'b' alias but keeps 'bold' active
mapper.removeOutput("b");

console.log(mapper.includesId(["b"]));    // false
console.log(mapper.includesId(["bold"])); // true
```

---

### Example: Removing Multiple Blocks

Since `removeOutput()` accepts a single string parameter, use array iteration to remove multiple blocks at once:

```js
import { HTML } from "sommark";
const mapper = HTML.clone();

const blocksToRemove = ["script", "style", "iframe"];
blocksToRemove.forEach(id => mapper.removeOutput(id));
```

---

### Example: Creating a Restricted Mapper

Surgically strip sensitive blocks from a cloned mapper instance:

```js
import { HTML } from "sommark";

const safeHTML = HTML.clone();

// Strip scripting and styling blocks
safeHTML.removeOutput("script");
safeHTML.removeOutput("style");
safeHTML.removeOutput("iframe");
```

---

> [!NOTE]
> SomMark's engine automatically calls `removeOutput()` behind the scenes in `.register()` and `.inherit()` to prevent duplicate block registrations.