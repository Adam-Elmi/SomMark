# hideRuntimeOutput

Instructs the transpiler to omit all `<script>` tags from the markup output, while retaining their scoping attributes.
---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format, hideRuntimeOutput })

// 2. In transpile options
transpile({ src, format, hideRuntimeOutput })
```

**Default Value:** `false`

**Usage:**
```js
import { transpile } from "sommark";

const template = `
[div]
  [h1]Title[end]
  runtime \${ console.log(self); }\$
[end]
`;

const html = await transpile({
  src: template,
  format: "html",
  hideRuntimeOutput: true
});
console.log(html);
// Output: <div data-sommark-id="sommark-div-1f2a3d4e"><h1>Title</h1></div>
```

---

### Example: Decoupled Script & Layout Compiling

Combining `hideRuntimeOutput` and `generateRuntimeOutput` allows separate delivery of pristine templates and bundled scripts:

```javascript
import SomMark from "sommark";

const smark = new SomMark({
  src: '[div]Content[end]\nruntime ${ alert(self); }$',
  format: "html"
});

// 1. Compile pristine markup without script tags
const htmlMarkup = await smark.transpile({ hideRuntimeOutput: true });
console.log(htmlMarkup);
// Output: <div data-sommark-id="sommark-div-e5f6a7b8">Content</div>

// 2. Compile execution script bundle separately
const scriptBundle = await smark.transpile({ generateRuntimeOutput: true });
console.log(scriptBundle);
/*
Output:
(async function(){const self = document.querySelector('[data-sommark-id="sommark-div-e5f6a7b8"]');
if (self) {
alert(self);
}
})();
*/
```

[Read generateRuntimeOutput.md for scripting bundles](generateRuntimeOutput.md)
[Read transpile.md for compilation pipelines](transpile.md)
