# removeOutput()

Removes a specific identifier (tag name or alias) from the mapper's registered outputs.

---

**Syntax:**
```js
mapper.removeOutput(id)
```

**Usage:**
```js
import { MARKDOWN } from "sommark";
const mapper = MARKDOWN.clone();

// Removes horizontal rule [hr] tag from registered tags
mapper.removeOutput("hr");
```

---

### Example: Surgical Alias Removal

If a tag is registered with multiple aliases (e.g., `["bold", "b"]`), removing one alias keeps the remaining ones active:

```js
import { MARKDOWN } from "sommark";
const mapper = MARKDOWN.clone();

// Disables the 'b' alias but keeps 'bold' active
mapper.removeOutput("b");

console.log(mapper.includesId(["b"]));    // false
console.log(mapper.includesId(["bold"])); // true
```

---

### Example: Removing Multiple Tags

Since `removeOutput()` accepts a single string parameter, use array iteration to remove multiple tags at once:

```js
import { HTML } from "sommark";
const mapper = HTML.clone();

const tagsToRemove = ["script", "style", "iframe"];
tagsToRemove.forEach(tag => mapper.removeOutput(tag));
```

---

### Example: Creating a Restricted Mapper

Surgically strip sensitive tags from a cloned mapper instance:

```js
import { HTML } from "sommark";

const safeHTML = HTML.clone();

// Strip scripting and styling tags
safeHTML.removeOutput("script");
safeHTML.removeOutput("style");
safeHTML.removeOutput("iframe");
```

---

> [!NOTE]
> SomMark's engine automatically calls `removeOutput()` behind the scenes in `.register()` and `.inherit()` to prevent duplicate tag registrations.