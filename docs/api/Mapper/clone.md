# clone()

Creates a deep copy of the mapper instance, isolating all property and block registrations to prevent shared state bugs.

---

**Syntax:**
```js
mapper.clone()
```

**Usage:**
```js
import { HTML } from "sommark";

// Creates an independent deep copy of the HTML mapper
const customMapper = HTML.clone();
```

---

### Example: Restricting Block Support (Security Isolation)

You can clone a mapper to strip potentially unsafe blocks without affecting the original:

```js
import { HTML } from "sommark";

// 1. Create a secure copy of the HTML mapper
const safeHTML = HTML.clone();

// 2. Remove blocks from the clone only
safeHTML.removeOutput("script");
safeHTML.removeOutput("style");

// safeHTML no longer supports [script] or [style],
// but the original HTML mapper remains completely untouched.
```

---

### Example: Contextual Options Overrides

Clone a mapper to apply configuration changes that should only affect a single part of your project:

```js
import { MARKDOWN } from "sommark";

// 1. Create a clone
const blogMarkdown = MARKDOWN.clone();

// 2. Adjust styling options on the copy
blogMarkdown.options.trimAndWrapBlocks = true;

// Original MARKDOWN options remain untouched
```

---

> [!TIP]
> Always use **`clone()`** instead of direct assignment (`const copy = original`) to avoid shared state bugs where modifying a copy accidentally mutates the source mapper.
