# filename

The name of the active file, used for providing detailed error logs and resolution contexts.
---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format, filename })

// 2. In transpile options
transpile({ src, format, filename })

// 3. In lex/parse helpers
lex(src, filename)
parse(src, filename)
```

**Usage:**
```js
import { transpile } from "sommark";

const output = await transpile({
  src: "[h1]Hello[end]",
  format: "html",
  filename: "components/Header.smark"
});
```

---

### Example: Error Report Traceability

Specifying a `filename` provides exact file context in compiler syntax errors:

```javascript
import { lex } from "sommark";

try {
  // Missing closing bracket error
  await lex("[h1 Hello", "src/views/Home.smark");
} catch (err) {
  console.error(err.message);
  // Contains trace details referencing "src/views/Home.smark"
}
```

[Read src.md for source input details](src.md)
[Read transpile.md for compiling templates](transpile.md)
