# SomMark Security Architecture

SomMark is built on a **secure-by-default** model. Because templates can execute sandboxed JavaScript (such as `static ${ ... }$`), the engine isolates execution contexts, enforces strict network limitations, and applies CPU limits to protect against Remote Code Execution (RCE), Server-Side Request Forgery (SSRF), Denial of Service (DoS), and Cross-Site Scripting (XSS).

---

## 1. Sandbox Isolation (QuickJS VM)

All compile-time scripts are executed inside a secure, lightweight WebAssembly **QuickJS sandbox** instead of the host Node.js process:
* **Context Cleansing**: Sandbox environments have no access to Node.js global objects like `process`, `require`, or system APIs.
* **Scope Isolation**: Variable scopes inside logic blocks are isolated on a parallel stack, preventing prototype pollution or state leaks between templates.

## 2. SSRF & Network Protections

Intranet endpoints, localhost, and cloud metadata endpoints are strictly protected:
* **Fetch Regulator**: The standard `fetch` API is replaced with a custom adapter that blocks requests to private IPv4 and IPv6 subnets (e.g., `127.0.0.1`, `169.254.169.254`).
* **Origin Whitelisting**: Network access can be constrained to explicit whitelisted domains and specific file extensions.
* **SSL Enforcement**: Cleartext HTTP requests are blocked by default, requiring HTTPS.

## 3. Resource & DoS Mitigations

To prevent infinite loops, hangs, or recursive memory exhaustion:
* **Execution Timeout**: An interrupt watchdog automatically terminates the virtual machine if a template script runs longer than the configured timeout limit.
* **Recursion Guard**: A strict depth counter tracks active template nesting levels, aborting circular or deeply recursive imports.

## 4. XSS & Output Sanitization

SomMark ensures that generated outputs are clean:
* **Auto-Escaping**: Dynamic tag attributes built via the compiler are automatically HTML-escaped.
* **Raw Content Controls**: Injecting raw unescaped HTML via `SomMark.raw` is blocked by default.
* **Sanitizer Hook**: A custom HTML sanitization function can be registered on the engine to clean raw HTML before it is output.

---

## Security API Configuration

You can customize all safety boundaries through the `security` settings object:

```javascript
import SomMark from "sommark";
import DOMPurify from "dompurify";

const compiler = new SomMark({
    src: "Total cost: static ${ 50 + 20 }$",
    format: "html",
    security: {
        timeout: 2000,                  // Kill scripts after 2 seconds
        maxDepth: 5,                    // Stop nesting recursion at 5 levels
        allowRaw: true,                 // Enable raw HTML helper
        sanitize: (h) => DOMPurify.sanitize(h), // Sanitize raw HTML injections
        allowFetch: true,               // Allow sandboxed network queries
        allowHttp: false,               // Block insecure HTTP queries
        allowedOrigins: ["api.site.com"], // Whitelisted fetch destinations
        allowedExtensions: [".json"]    // Whitelisted fetch path extensions
    }
});

const output = await compiler.transpile();
```

---

[Read the Security API Documentation](../../api/Core/security.md) for a comprehensive list of properties and usage examples.
