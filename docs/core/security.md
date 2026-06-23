# Security

SomMark's templates can run JavaScript at compile time (`${ ... }$` blocks). To keep this safe, all scripts run inside a **sandboxed VM** that is completely isolated from your computer. The sandbox cannot read files, make arbitrary network requests, or run indefinitely.

---

## 1. Script Isolation

All compile-time scripts run inside **QuickJS** — a small JavaScript engine compiled to WebAssembly. It is completely separate from the Node.js process running SomMark.

* **No access to Node.js**: Scripts cannot call `require`, `process`, `fs`, or any Node.js API.
* **No shared state**: Variables inside one script block cannot affect another template's scope.

## 2. Network Protection

`SomMark.fetch()` is a guarded wrapper, not the real `fetch`. It blocks:

* **Private/internal addresses**: `localhost`, `127.0.0.1`, `10.*`, `192.168.*`, `172.16–31.*`, `169.254.*`, `[::1]`
* **Plain HTTP**: Only HTTPS is allowed by default
* **Unlisted domains**: If you configure `allowedOrigins`, only those domains can be reached
* **Unlisted file types**: If you configure `allowedExtensions`, only those extensions can be fetched

## 3. Timeout Protection

If a script runs too long — due to an infinite loop or a very slow request — SomMark automatically kills it. The default limit is 5 seconds. Imports that go too deep (more than 5 levels by default) are also stopped before they can cause problems.

## 4. Output Safety

* **Auto-escaping**: Block attribute values are HTML-escaped automatically.
* **Raw output blocked by default**: `SomMark.raw()` throws an error unless you set `security.allowRaw: true`.
* **Sanitizer hook**: If you enable raw output, you can pass a `sanitize` function that cleans the HTML before it is written to the output.

---

## Configuration

All security settings go in the `security` option:

```javascript
import SomMark from "sommark";
import DOMPurify from "dompurify";

const compiler = new SomMark({
    src: "Total cost: static ${ 50 + 20 }$",
    format: "html",
    security: {
        timeout: 2000,                          // Kill scripts after 2 seconds
        maxDepth: 5,                            // Stop import nesting at 5 levels
        allowRaw: true,                         // Allow SomMark.raw()
        sanitize: (h) => DOMPurify.sanitize(h), // Clean raw HTML before output
        allowFetch: true,                       // Allow SomMark.fetch()
        allowHttp: false,                       // Block plain HTTP (HTTPS only)
        allowedOrigins: ["api.site.com"],       // Only allow this domain
        allowedExtensions: [".json"]            // Only allow .json files
    }
});

const output = await compiler.transpile();
```

---

[Read the Security API Documentation](../../api/Core/security.md) for a full list of properties and examples.
