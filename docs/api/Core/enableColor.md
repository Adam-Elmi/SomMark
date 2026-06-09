# enableColor()

Globally enables or disables ANSI color escape codes for terminal compilation error and warning messages.
---

**Syntax:**
```js
enableColor(enabled?)
```

**Usage:**
```js
import { enableColor, transpile } from "sommark";

// Enable rich terminal colors globally
enableColor(true);

// Error logging now displays with beautiful ANSI escape sequences
try {
  await transpile({ src: "[h1 Unclosed tag", format: "html" });
} catch (err) {
  console.error(err.message);
}
```

---

### Example: Toggling Console Colors

You can turn terminal colorization on or off at any point in your script:

```javascript
import { enableColor } from "sommark";

// 1. Enable color formatting (Default off)
enableColor(true); 

// 2. Disable color formatting
enableColor(false);
```

[Read security.md for compile sandboxing](security.md)

[Read transpile.md for pipeline settings](transpile.md)
