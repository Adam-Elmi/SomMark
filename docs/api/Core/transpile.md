# transpile()

Turns raw SomMark source code or a pre-built AST into final formatted outputs (HTML, Markdown, MDX, XML, JSON, etc.).
---

**Syntax:**
```js
transpile(options)
```

**Usage:**
```js
import { transpile } from "sommark";

const output = await transpile({
    src: "[h1]Hello World[end]",
    format: "markdown"
});
```

---

### Example: Transpiling from Raw Source

Enforce the target `format` and feed raw templates:

```javascript
import { transpile } from "sommark";

const html = await transpile({
    src: "[div = class: \"card\"]Content[end]",
    format: "html"
});
console.log(html);
// Output: <div class="card">Content</div>
```

### Example: Transpiling directly from a pre-built AST (Bypassing Parser)

You can pass a pre-built or programmatically modified AST directly to bypass the parsing stage:

```javascript
import { transpile } from "sommark";

const customAst = [
    {
        type: "Block",
        id: "h1",
        args: {},
        body: [
            {
                type: "Text",
                text: "Hello from Custom AST!"
            }
        ]
    }
];

const html = await transpile({
    ast: customAst,
    format: "html"
});
console.log(html);
// Output: <h1>Hello from Custom AST!</h1>
```

### Example: Strict Argument Validation

Omitting both `src` and `ast`, or omitting `format` entirely throws a descriptive `Runtime Error`:

```javascript
import { transpile } from "sommark";

// Throws error: Missing Target Format
try {
  await transpile({ src: "[h1]Hello[end]" });
} catch (error) {
  console.error(error);
  // Output: [Runtime Error]: Missing Target Format: The 'format' parameter is required for transpilation...
}

// Throws error: Missing Input
try {
  await transpile({ format: "html" });
} catch (error) {
  console.error(error);
  // Output: [Runtime Error]: Missing Input: Either 'src' or 'ast' must be provided for transpilation.
}
```

---

<details>
<summary><b>View Supported Configuration Options</b></summary>

| Option | Type | Default | Description |
|:---|:---|:---|:---|
| `src` | `string` | `null` | The raw Smark source code (Required if `ast` is not provided). |
| `ast` | `Array` | `null` | A pre-built AST array (Required if `src` is not provided). |
| `format` | `string` | **Required** | Target format (`html`, `markdown`, `mdx`, `json`, `xml`, etc.). |
| `mapperFile` | `Mapper` | `null` | A custom Mapper instance containing tag definitions. |
| `filename` | `string` | `"anonymous"` | File path identifier used in error contexts. |
| `placeholders` | `object` | `{}` | Global data injected for `p{key}` placeholders. |
| `fallbackTarget` | `string\|false` | `"style"` | Styling fallbacks target (`"style"`, `"class"`, or `false`). |
| `removeComments` | `boolean` | `true` | Strips comments and blocks from the output. |
| `customProps` | `Array<string>` | `[]` | Whitelisted attributes allowed to pass untouched. |
| `security` | `object` | `{}` | Execution sandbox rules (e.g. `allowRaw`, `maxDepth`, `timeout`). |

</details>

---

[Read parse.md for information on AST generation](parse.md)
[Read lex.md for details on tokenization](lex.md)
