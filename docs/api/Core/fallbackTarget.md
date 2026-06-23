# fallbackTarget

Controls how unrecognized block attributes are rendered when they are not in `customProps` and not native HTML attributes.

---

**Syntax:**
```js
new SomMark({ src, format, fallbackTarget })
```

**Supported values:**

| Value | Behavior |
| :--- | :--- |
| `true` *(default)* | Unknown attributes are compiled into the `style` attribute as inline CSS. |
| `"style"` | Alias for `true` — accepted for backward compatibility. |
| `false` | No fallback. Unknown attributes are rendered as standard HTML attributes. |

---

**Example:**
```js
import { transpile } from "sommark";

const output = await transpile({
  src: '[div = spacing: 20]Box[end]',
  format: "html",
  fallbackTarget: true
});
console.log(output);
// <div style="spacing:20;">Box</div>
```

---

### Comparing the two modes

```ini
[div = primary: true, size: "large"]Content[end]
```

```js
// fallbackTarget: true (default)
await transpile({ src, format: "html", fallbackTarget: true });
// <div style="primary:true;size:large;">Content</div>

// fallbackTarget: false
await transpile({ src, format: "html", fallbackTarget: false });
// <div primary="true" size="large">Content</div>
```

[Read customProps.md for whitelisting attributes](customProps.md)

[Read transpile.md for compilation pipelines](transpile.md)
