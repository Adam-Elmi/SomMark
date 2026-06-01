# The Placeholder Layer `p{}`

`p{}` is SomMark's global data-injection hook. Unlike local variables (`v{}`), placeholders resolve global values passed down from your Javascript configuration across the entire compilation graph.

---

## 1. How It Works

*   **Global Resolution**: Placeholders are passed to the `placeholders` option in the SomMark constructor or `transpile()` function.
*   **Propagation**: Placeholders propagate globally to all imported `.smark` components and modules in your project.
*   **Safety Envelope**: If a placeholder is not found, it is rendered as a high-visibility envelope (`SOMMARK_UNRESOLVED_p_key_SOMMARK`) in the final output so developers can easily identify missing global configurations.

---

## 2. Global Text Injection

You can inject global metadata (like site names, versions, or author profiles) directly into any template.

### Example: Injecting Site Metadata
**JavaScript Configuration**
```javascript
import { transpile } from "sommark";

const output = await transpile({
  src: "[header] Welcome to p{siteName}! [end]",
  format: "html",
  placeholders: {
    siteName: "SomMark Documentation"
  }
});
```

**Rendered HTML**
```html
<header> Welcome to SomMark Documentation! </header>
```

---

## 3. Global Prop Injection

Placeholders can also be resolved inside tag headers to inject dynamic global props (like asset paths, API domains, or environment states).

### Example: Injecting Base Asset Paths
**JavaScript Configuration**
```javascript
import { transpile } from "sommark";

const output = await transpile({
  src: "[img = src: 'p{cdnUrl}/images/logo.png', alt: 'Logo' !]",
  format: "html",
  placeholders: {
    cdnUrl: "https://cdn.example.com"
  }
});
```

**Rendered HTML**
```html
<img src="https://cdn.example.com/images/logo.png" alt="Logo" />
```

---

## 4. Propagation into Sub-Components

Placeholders automatically cascade to all sub-components. You do not need to pass them down manually.

### Example: Nested Component Propagation
**Component (`Card.smark`)**
```ini
[div = class: "card"]
  [p] Powered by p{brandName} [end]
[end]
```

**Usage (`index.smark`)**
```ini
[import = Card: "./Card.smark"][end]

# No need to explicitly pass p{brandName} into [Card]!
[Card !]
```

**JavaScript Configuration**
```javascript
import { transpile } from "sommark";

const output = await transpile({
  src: await fs.readFile("./index.smark", "utf-8"),
  format: "html",
  placeholders: {
    brandName: "SomMark Engine"
  }
});
```

**Rendered HTML**
```html
<div class="card">
  <p>Powered by SomMark Engine</p>
</div>
```