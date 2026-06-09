# removeComments

Controls whether comments are stripped or preserved in the final output.
---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format, removeComments })

// 2. In transpile options
transpile({ src, format, removeComments })
```

**Default Value:** `true` (comments are stripped by default).

**Usage:**
```js
import { transpile } from "sommark";

const output = await transpile({
  src: "### Important comment ###\n[h1]Hello[end]",
  format: "html",
  removeComments: false // Preserve comments in formats that support them
});
```

---

### Example: Stripping vs Preserving in JSONC

JSONC supports preservation of single-line and multiline comments when `removeComments` is set to `false`:

```javascript
import { transpile } from "sommark";

const template = `
### Configuration settings ###
[string = "env", value: "prod" !]
`;

// 1. With removeComments: true (Default)
const stripped = await transpile({
  src: template,
  format: "jsonc",
  removeComments: true
});
console.log(stripped);
// Output: { "env": "prod" }

// 2. With removeComments: false
const preserved = await transpile({
  src: template,
  format: "jsonc",
  removeComments: false
});
console.log(preserved);
// Output: 
// /* Configuration settings */
// { "env": "prod" }
```

[Read format.md for formats support](format.md)

[Read TOKEN_TYPES.md for comment token structures](TOKEN_TYPES.md)
