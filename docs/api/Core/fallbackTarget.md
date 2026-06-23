# fallbackTarget

Controls how unrecognized block attributes are rendered when they are not in `customProps` and not native HTML attributes.

---

**Syntax:**
```js
// In engine options
new SomMark({ src, format, fallbackTarget })

// In transpile options
transpile({ src, format, fallbackTarget })
```

**Supported values:**

| Value | Behavior |
| :--- | :--- |
| `"style"` *(default)* | Unknown attributes are compiled into the `style` attribute as inline CSS. |
| `false` | No fallback. Unknown attributes are rendered as standard HTML attributes. |

---

**Example:**
```js
import { transpile } from "sommark";

const output = await transpile({
  src: '[div = spacing: 20]Box[end:div]',
  format: "html",
  fallbackTarget: "style"
});
console.log(output);
// <div style="spacing:20;">Box</div>
```

---

### Comparing the two modes

```ini
[div = primary: true, size: "large"]Content[end:div]
```

```js
// fallbackTarget: "style" (default)
await transpile({ src, format: "html", fallbackTarget: "style" });
// <div style="primary:true;size:large;">Content</div>

// fallbackTarget: false
await transpile({ src, format: "html", fallbackTarget: false });
// <div primary="true" size="large">Content</div>
```

[Read customProps.md for whitelisting attributes](customProps.md)

[Read transpile.md for compilation pipelines](transpile.md)
