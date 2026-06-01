# import()

Loads, parses, and serializes a local server-side file synchronously at compile-time, baking its contents directly into the target output script.
---

**Syntax:**
```js
SomMark.import(filePath);
```

**Usage:**
```javascript
runtime ${
  // Imports locales.json synchronously at compile-time and embeds it directly as a JSON object literal
  const locales = SomMark.import("./locales.json");
  console.log("Greeting:", locales.welcome);
}$ 
```

---

### How It Works

1. **Scans the calls:** The preprocessor scans `runtime ${ ... }$` blocks before compiling to locate `SomMark.import(...)` calls.
2. **Resolves the path:** Resolves the specified path relative to the template file's active folder (or `process.cwd()` if compiling anonymously).
3. **Parses & Serializes:** 
   - **JSON Files (`.json`):** Parses the content and serializes it as a native JavaScript **Object Literal** (loaded and available immediately in the runtime environment).
   - **Text & Smark Files (`.txt`, `.smark`):** Reads the content and serializes it as a single, JSON-escaped **String Literal** (preserving newlines and quotes safely).
4. **Replaces inline:** Splicing the serialized content directly into the runtime script block. This enables **instant, synchronous access** to the data at run-time without requiring asynchronous fetches or runtime promises.

---

### Important Guidelines

*   **Runtime blocks only:** `SomMark.import` is designed and preprocessed strictly inside `runtime ${ ... }$` blocks. Calling it inside a `static ${ ... }$` block will throw a `Logic Error: not a function` exception.
*   **Static argument:** The file path must be passed as a static string literal (e.g. `'./config.json'`). Dynamic runtime variables cannot be resolved at build-time.
*   **Security Whitelisting:** Respects the active compiler security whitelists (such as `allowedExtensions`). If an import targets an unauthorized extension, Smark aborts compilation immediately with a security exception.

> [!IMPORTANT]
> **Static Block Alternatives:**
> Inside `static ${ ... }$` blocks, you can load local files synchronously using standard **JavaScript ES Module Imports** instead, thanks to Smark's native VM module loader:
> ```javascript
> static ${
>   import pkg from "./package.json";
>   return pkg.version;
> }$
> ```

### Example: Importing Local Configurations

Embeds translation maps directly into the target runtime script:

**File:** `index.smark`
```ini
[div = class: "app"]
  runtime ${
    const translations = SomMark.import("./locales.json");
    console.log("Active Greeting:", translations.hello);
  }$
[end]
```

**locales.json:**
```json
{
  "hello": "Welcome to Smark!"
}
```

**Via CLI:**
```sh
sommark --html -p index.smark
```

**Output:**
```html
<div class="app" data-sommark-id="sommark-div-a12b">
  <script>
    /* global SomMark */
    if (typeof globalThis.SomMark === 'undefined') { globalThis.SomMark = { static: (c) => c, import: (c) => c }; }
    (async function(){
      const self = document.querySelector('[data-sommark-id="sommark-div-a12b"]');
      const translations = {"hello": "Welcome to Smark!"};
      console.log("Active Greeting:", translations.hello);
    })();
  </script>
</div>
```

---

[Read static.md for compile-time expression baking](static.md)

[Read settings.md for global configuration access](settings.md)

[Read fetch.md for secure compile-time HTTP requests](fetch.md)
