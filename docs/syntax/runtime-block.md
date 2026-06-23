# Runtime Blocks

Preserves JavaScript logic blocks intact inside the target document to be executed in the target client runtime environment (such as the browser or specialized scripts). It includes full support for scope isolation, compile-time variable baking, and local file imports.
---

**Syntax:**
```js
runtime ${ /* js code here */ }$
```

---

### Static vs. Runtime: Quick Comparison

| Feature | Static Blocks (`static`) | Runtime Blocks (`runtime`) |
| :--- | :--- | :--- |
| **Execution Time** | Server-side at compile-time | Run-time in the client environment |
| **Environment** | Sandboxed QuickJS VM on the server | Target runtime context (e.g. Browser DOM) |
| **Global Scope** | Shared across all static blocks | Standard global context (e.g. browser `window`) |
| **Block Scope** | Scoped to parent AST blocks | Isolated scope context (e.g. via an IIFE wrapper) |
| **Core Output** | Formatted literal values (numbers, text) | Emitted script blocks containing JavaScript |

---

### How It Works

#### 1. Global vs. Scoped Local Contexts
Runtimes are formatted by target language mappers. In the standard **HTML** mapper (as the typical template target), Smark automatically manages scope isolation:
*   **Global Level (Template Root):** Emitted directly inside a standard root script element:
    ```html
    <script>
    console.log("Global client execution");
    </script>
    ```
*   **Block Level (Inside Blocks like `[div]`):** Encapsulated inside an isolated, asynchronous self-executing function (`IIFE`) to prevent namespace collisions. The host block automatically gets a unique `data-sommark-id="[secretId]"` attribute, and a dynamic `self` reference is resolved via query selection:
    ```html
    <div data-sommark-id="sommark-div-a12b">
      <script>
      (async function(){
        const self = document.querySelector('[data-sommark-id="sommark-div-a12b"]');
        if (self) {
          // Your block logic here...
        }
      })();
      </script>
    </div>
    ```

#### 2. Safety Guards
If your runtime script references the `SomMark` standard library (e.g. for static baking or file imports), Smark pre-processes the block to inject standard global variable safety guards (`/* global SomMark */`). This prevents script crashes at runtime:
```javascript
/* global SomMark */
if (typeof globalThis.SomMark === 'undefined') { 
    globalThis.SomMark = { static: (c) => c, import: (c) => c }; 
}
```

---

### Specialized Preprocessing APIs (`SomMark`)

Smark pre-processes runtime scripts before generating the final compilation output, resolving two specialized synchronous build-time APIs:

#### A. Static Variable Baking (`SomMark.static`)
Evaluates any JavaScript statement or shared variable inside the server-side sandboxed VM at compile-time, and bakes its serialized value synchronously directly into the runtime script:
```javascript
const maxAllowedItems = SomMark.static("maxItems");
```
*Baked Output:*
```javascript
const maxAllowedItems = 100;
```

#### B. Compile-Time File Importing (`SomMark.import`)
Loads local files (such as `.json`, `.txt`, or `.smark`) from the server filesystem synchronously during compilation, and injects their raw parsed contents directly into the runtime script:
```javascript
const locales = SomMark.import("../locales/en.json");
```
*Baked Output:*
```javascript
const locales = {"welcome": "Hello World"};
```

---

### Examples

#### 1. Scoped Component Logic (using `self`)
Use block-level runtimes to create self-contained interactive components. The parent element is bound to `self`, allowing localized DOM queries:

**File**: `component.smark`
```ini
[div = class: "card"]
  [button = id: "btn"]Click Me[end:button]

  runtime ${
    const button = self.querySelector("#btn");
    button.addEventListener("click", () => {
      self.style.backgroundColor = "lightblue";
    });
  }$
[end:div]
```

**Output**:
```html
<div class="card" data-sommark-id="sommark-div-a12b">
  <button id="btn">Click Me</button>
  <script>
  (async function(){
    const self = document.querySelector('[data-sommark-id="sommark-div-a12b"]');
    if (self) {
      const button = self.querySelector("#btn");
      button.addEventListener("click", () => {
        self.style.backgroundColor = "lightblue";
      });
    }
  })();
  </script>
</div>
```

---

#### 2. Server-to-Client Data Baking (`SomMark.static`)
Declare settings or fetch dynamic data on the server during compilation, then bake those variables directly into client scripts:

**File**: `bake.smark`
```ini
${
  // Run on the server
  let mode = "development";
  let apiEndpoint = "https://dev.api.example.com";
}$

[div]
  runtime ${
    // Baked from server variables
    const config = {
      env: SomMark.static("mode"),
      url: SomMark.static("apiEndpoint")
    };
    console.log(`Configured for ${config.env} at ${config.url}`);
  }$
[end:div]
```

**Output**:
```html
<div data-sommark-id="sommark-div-a12b">
  <script>
  /* global SomMark */
  if (typeof globalThis.SomMark === 'undefined') { globalThis.SomMark = { static: (c) => c, import: (c) => c }; }
  (async function(){
    const self = document.querySelector('[data-sommark-id="sommark-div-a12b"]');
    if (self) {
      const config = {
        env: "development",
        url: "https://dev.api.example.com"
      };
      console.log(`Configured for ${config.env} at ${config.url}`);
    }
  })();
  </script>
</div>
```

---

#### 3. Compile-Time JSON Imports (`SomMark.import`)
Load dynamic configurations or static metadata files into client scripts without making runtime HTTP requests:

**File**: `import.smark`
```ini
[div]
  runtime ${
    // Loads and JSON-serializes translation file at compile-time
    const translations = SomMark.import("./locales.json");
    console.log("Greeting:", translations.hello);
  }$
[end:div]
```

**Output**:
```html
<div data-sommark-id="sommark-div-a12b">
  <script>
  /* global SomMark */
  if (typeof globalThis.SomMark === 'undefined') { globalThis.SomMark = { static: (c) => c, import: (c) => c }; }
  (async function(){
    const self = document.querySelector('[data-sommark-id="sommark-div-a12b"]');
    if (self) {
      const translations = {"hello": "Welcome to Smark!"};
      console.log("Greeting:", translations.hello);
    }
  })();
  </script>
</div>
```

---

### Behavior and Rules

> [!NOTE]
> Runtime logic is only processed and emitted by target language mappers that natively support script execution (such as **HTML**).
> Targets like **JSON**, **XML**, and **MDX** will silently discard runtime logic blocks to protect outputs from syntax or tag collisions.

> [!IMPORTANT]
> To use `SomMark.import` or `SomMark.static` inside a runtime block, the JavaScript code must be syntactically valid at the top level so that it parses successfully. If a syntax error is found during build time, the block bypasses pre-processing and is emitted as-is.

> [!WARNING]
> Security rules (such as `allowedExtensions`) are strictly enforced at build-time. If `SomMark.import` attempts to import a file whose extension is not allowed by the compiler's active security context, the transpiler throws a security exception immediately.
