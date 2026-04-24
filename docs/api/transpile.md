# transpile

The `transpile` method is the primary engine for turning SomMark code into its final formatted output.

---

## 1. Standalone Function (Direct Import)

The easiest way to use SomMark is the standalone `transpile` function. It accepts a single **options object** containing everything the engine needs.

### Signature: `transpile(options = {})`

```js
import { transpile } from "sommark";

const output = await transpile({
    src: "[h1]Hello World[end]",
    format: "markdown",
    placeholders: { user: "Adam" }
});
```

---

## 2. Instance Method (Class Member)

If you have already created a `SomMark` instance, the method only accepts **one optional argument** (the source code) because it uses the instance's existing settings.

### Signature: `sm.transpile(src = this.src)`

```js
import SomMark from "sommark";

const sm = new SomMark({ 
    format: "html",
    placeholders: { user: "Adam" }
});

// Inherits config from 'sm'
const output = await sm.transpile("[h1]Hello Instance[end]");
```

---

## 3. Configuration Options

The following options are supported by the standalone `transpile` function and the `SomMark` constructor:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **`src`** | `string` | **Required** | The raw SomMark source code. |
| **`format`** | `string` | `"html"` | Target output format (`html`, `markdown`, `mdx`, `json`, `xml`). |
| **`mapperFile`** | `Mapper` | `null` | A custom Mapper instance containing your tag rules. |
| **`filename`** | `string` | `"anonymous"` | Source name for error reports and module resolution. |
| **`placeholders`**| `object` | `{}` | Key-value pairs for `p{}` lookups. |
| **`removeComments`**| `boolean`| `true` | If `true`, strips `# comments` from the output. |
| **`customProps`** | `array` | `[]` | Whitelist of extra HTML attributes allowed in tags. |

---

## 4. Why use Async?

Transpilation is always asynchronous because it involves:
1.  **Module Resolution**: Resolving external `[import]` and `[$use-module]` blocks.
2.  **Streaming Architecture**: Efficiently processing large documents without locking the event loop.
