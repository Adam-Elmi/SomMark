# SomMark Class

The `SomMark` class is the core compilation engine that translates SomMark templates into target output formats (like HTML, Markdown, XML, or JSON).

For the complete list of individual properties, methods, constructor options, and sandbox/compiler configurations, see the [Detailed API Reference](./api/Core/).

---

## 1. Initialization

You can initialize and execute the compiler in two ways:

### Engine Class Instantiation
Creates a persistent compiler instance for step-by-step tag registration, inheritance pipelines, and translation execution:
```javascript
// nodejs
import SomMark from "sommark";

// Initialize the compiler instance
const compiler = new SomMark({
  src: "[h1]Hello World[end]",
  format: "html"
});

// Run translation
const output = await compiler.transpile();
```

### Standalone transpile Helper
The high-level wrapper to immediately compile Smark templates in a single call:
```javascript
// nodejs
import { transpile } from "sommark";

const output = await transpile({
  src: "[h1]Hello World[end]",
  format: "html"
});
```
