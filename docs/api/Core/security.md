# security

A configuration object that defines sandboxing and resource restrictions for compilation.

---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format, security })

// 2. In transpile options
transpile({ src, format, security })
```

**Supported Options:**
*   `allowRaw` (`boolean`, default: `true`): If `false`, raw unescaped code execution is blocked and all output is escaped.
*   `maxDepth` (`number`, default: `5`): Maximum stack depth allowed for module recursion.
*   `timeout` (`number`, default: `5000`): Maximum milliseconds allowed for static logic scripts to execute.
*   `sanitize` (`function`, default: `null`): A custom HTML sanitizer function `(html) => string` for unescaped output.
*   `allowFetch` (`boolean`, default: `true`): If `false`, VM network fetch requests are blocked.
*   `allowHttp` (`boolean`, default: `false`): If `false`, only `https` URLs can be fetched.
*   `allowedOrigins` (`Array<string>`, default: `null`): Whitelisted domains allowed to be fetched.
*   `allowedExtensions` (`Array<string>`, default: `null`): Whitelisted file extensions permitted in local imports (`SomMark.import`) and network fetch URL paths (`SomMark.fetch`).
*   `env` (`Array<string>`, default: `null`): Allowlist of environment variable names that `SomMark.env()` is permitted to read. Any key not listed returns `undefined`, even if it exists in the environment.

---

**Usage:**
```js
import { transpile } from "sommark";

const output = await transpile({
  src: "static ${ SomMark.fetch('https://api.example.com/data') }$",
  format: "html",
  security: {
    allowFetch: true,
    allowedOrigins: ["api.example.com"]
  }
});
```

---

### Example: Script Execution Timeout

Restrict static script evaluation times using `timeout` to prevent long-running tasks:

```javascript
import { transpile } from "sommark";

try {
  await transpile({
    src: "static ${ while(true){} }$",
    format: "html",
    security: { timeout: 100 } // Stops execution after 100ms
  });
} catch (err) {
  console.error(err.message);
  // Output: Script execution timed out.
}
```

### Example: Allowed Extensions (Imports and Fetch)

Whitelist permitted file extensions to restrict both local template preprocessor imports and runtime network queries:

```javascript
import { transpile } from "sommark";

// 1. Restricts local preprocessor imports (SomMark.import)
try {
  await transpile({
    src: 'runtime ${ const config = SomMark.import("./config.json"); }$',
    format: "html",
    security: { allowedExtensions: [".smark"] } // Blocks .json files
  });
} catch (err) {
  console.error(err.message);
  // Output: File extension .json is not allowed by security policy.
}

// 2. Restricts runtime sandbox network requests (SomMark.fetch)
try {
  await transpile({
    src: 'static ${ await SomMark.fetch("https://api.example.com/data.json") }$',
    format: "html",
    security: {
      allowFetch: true,
      allowedOrigins: ["api.example.com"],
      allowedExtensions: [".smark"] // Blocks .json URL extensions
    }
  });
} catch (err) {
  console.error(err.message);
  // Output: Fetch Security Error: Extension '.json' is not whitelisted.
}
```

### Example: Escaping Raw Output (allowRaw)

When `allowRaw` is disabled, raw unescaped HTML injections via the standard `SomMark.raw` helper are blocked and throw a security error:

```javascript
import { transpile } from "sommark";

const source = 'static ${ SomMark.raw("<div>Raw HTML</div>") }$';

// 1. With allowRaw: true (Default)
console.log(await transpile({ src: source, format: "html", security: { allowRaw: true } }));
// Output: <div>Raw HTML</div>

// 2. With allowRaw: false
try {
  await transpile({ src: source, format: "html", security: { allowRaw: false } });
} catch (err) {
  console.error(err.message);
  // Output: Security Error: SomMark.raw is disabled in this environment.
}
```

### Example: Custom Sanitizer Hook (sanitize)

Supply a custom sanitization callback `(html) => string` to scrub raw HTML inputs before they are written to the output stream:

```javascript
import { transpile } from "sommark";

const output = await transpile({
  src: 'static ${ SomMark.raw("<p>Hello <script>alert(1)</script></p>") }$',
  format: "html",
  security: {
    allowRaw: true,
    sanitize: (html) => html.replace(/<script>.*?<\/script>/gi, "") // Simple strip script tags
  }
});
console.log(output);
// Output: <p>Hello </p>
```

### Example: HTTP Network Block (allowHttp)

Enforce SSL by blocking un-encrypted cleartext HTTP fetch requests inside logic sandboxes:

```javascript
import { transpile } from "sommark";

try {
  await transpile({
    src: 'static ${ await SomMark.fetch("http://api.example.com/data") }$',
    format: "html",
    security: { allowHttp: false } // Blocks cleartext http protocol
  });
} catch (err) {
  console.error(err.message);
  // Output: Fetch Security Error: HTTP requests are disabled. Use HTTPS instead.
}
```

### Example: Circular & Deep Recursion Limits (maxDepth)

Without a nesting limit, circular imports (e.g., File A imports File B, which imports File A) or extremely deep nested files would cause the compiler to recurse infinitely, freezing the server and crashing it with a **Stack Overflow** or **Out of Memory** error.

`maxDepth` sets a strict boundary on how deep nested imports (`[import]`) can go:

```javascript
import { transpile } from "sommark";

try {
  // If File A imports File B, which imports File C, which imports File D...
  await transpile({
    src: `
      [import = A: "./fileA.smark" !]
      [$use-module = A !]
    `,
    format: "html",
    security: { maxDepth: 3 } // Aborts if imports are nested deeper than 3 levels
  });
} catch (err) {
  console.error(err.message);
  // Output: Security Error: Recursion Guard: Maximum Smark compilation depth exceeded (limit is 3).
}
```

#### Why is the default limit `5` (`maxDepth: 5`)?

A default limit of `5` is a highly pragmatic, safe setting that protects shared servers from resource exhaustion (e.g., keeping multiple file descriptors and ASTs open simultaneously) while completely covering 99% of professional, real-world layout structures:

*   **Level 0 (Page Root)**: `index.smark`
*   **Level 1 (Template Wrapper)**: `layouts/MainLayout.smark`
*   **Level 2 (Section Component)**: `components/Navbar.smark`
*   **Level 3 (Atom Component)**: `components/Button.smark`
*   **Level 4 (Design System Token)**: `components/HeartIcon.smark`

Even in this highly-modular design system setup, the active nesting depth is only **4**.

#### Sibling Imports Do Not Increase Depth

`maxDepth` only tracks the depth of a **single active ancestry branch** (parent -> child -> grandchild). Populating the same shared template (such as a generic `button.smark` or `icon.smark`) across multiple sibling templates does **not** increase the depth limit.

#### Unrestricted Developer Freedom

If your layout requires extremely deep, multi-layered inheritance chains, you can easily increase or bypass this safety limit by setting `maxDepth` to any higher value (e.g., `15`, `50`, or `100`):

```javascript
const output = await transpile({
  src,
  format: "html",
  security: { maxDepth: 50 } // Full freedom for deep, complex layouts
});
```

[Read transpile.md for pipeline settings](transpile.md)

[Read format.md for formats mapping](format.md)
