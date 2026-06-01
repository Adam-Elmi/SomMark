# fallbackTarget

Controls how custom non-native attributes are rendered when not whitelisted in `customProps`.
---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format, fallbackTarget })

// 2. In transpile options
transpile({ src, format, fallbackTarget })
```

**Supported Options:**
*   `"style"` (Default) - Compiles custom attributes into the `style` attribute as inline CSS properties.
*   `"class"` - Compiles custom attributes into the `class` attribute (e.g. `key: "val"` becomes `class="key-val"`, booleans become `class="key"`).
*   `false` - Disables fallback smart handling completely. Custom attributes are rendered as standard HTML/XML attributes.

---

**Usage:**
```js
import { transpile } from "sommark";

const output = await transpile({
  src: '[div spacing: 20]Box[end]',
  format: "html",
  fallbackTarget: "style"
});
console.log(output);
// Output: <div style="spacing:20;">Box</div>
```

---

### Example: Comparative Targets

Changing `fallbackTarget` controls the exact representation of custom properties:

```javascript
import { transpile } from "sommark";

const source = '[div primary: true, size: "large"]Content[end]';

// 1. fallbackTarget: "style" (Default)
console.log(await transpile({ src: source, format: "html", fallbackTarget: "style" }));
// Output: <div style="primary:true;size:large;">Content</div>

// 2. fallbackTarget: "class"
console.log(await transpile({ src: source, format: "html", fallbackTarget: "class" }));
// Output: <div class="primary size-large">Content</div>

// 3. fallbackTarget: false
console.log(await transpile({ src: source, format: "html", fallbackTarget: false }));
// Output: <div primary="true" size="large">Content</div>
```

[Read customProps.md for whitelisting attributes](customProps.md)
[Read transpile.md for compilation pipelines](transpile.md)
