# placeholders

An object of key-value pairs representing dynamic build-time placeholders.
---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format, placeholders })

// 2. In transpile options
transpile({ src, format, placeholders })
```

**Usage:**
```js
import { transpile } from "sommark";

const output = await transpile({
  src: "[h1]Hello p{username}[end]",
  format: "html",
  placeholders: { username: "Adam" }
});
console.log(output);
// Output: <h1>Hello Adam</h1>
```

---

### Example: Custom Dynamic Injection

Placeholders are resolved at parsing time. If a placeholder is omitted or unresolved, it compiles to an unresolved envelope string in the format `SOMMARK_UNRESOLVED_p_[key]_SOMMARK`:

```javascript
import { transpile } from "sommark";

const template = "[p]Created by p{author} in p{city}[end]";

const output = await transpile({
  src: template,
  format: "html",
  placeholders: {
    author: "Elmi"
    // 'city' is omitted here
  }
});
console.log(output);
// Output: <p>Created by Elmi in SOMMARK_UNRESOLVED_p_city_SOMMARK</p>
```

[Read TOKEN_TYPES.md for PREFIX_P token definition](TOKEN_TYPES.md)
[Read parse.md for parser resolution steps](parse.md)
