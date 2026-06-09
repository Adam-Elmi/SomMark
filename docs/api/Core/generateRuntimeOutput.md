# generateRuntimeOutput

Instructs the transpiler to compile only the runtime scripts directly into a clean, bundled `.js` string.
---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format, generateRuntimeOutput })

// 2. In transpile options
transpile({ src, format, generateRuntimeOutput })
```

**Default Value:** `false`

**Usage:**
```js
import { transpile } from "sommark";

const jsBundle = await transpile({
  src: '[div]Text[end]\nruntime ${ console.log("running"); }$',
  format: "html",
  generateRuntimeOutput: true
});
console.log(jsBundle);
// Output:
// console.log("running");
```

---

### Example: Scope-Wrapped Block Scripts

If a runtime block script is placed inside an element that is mapped, the bundle generates a unique selector scope to wrap the execution:

```javascript
import { transpile } from "sommark";

const template = `
[div]
  [p]Scoped element[end]
  runtime \${ self.textContent = "hello"; }\$
[end]
`;

const output = await transpile({
  src: template,
  format: "html",
  generateRuntimeOutput: true
});
console.log(output);
/*
Output:
(async function(){const self = document.querySelector('[data-sommark-id="sommark-div-8a7f92b3"]');
if (self) {
self.textContent = "hello";
}
})();
*/
```

[Read hideRuntimeOutput.md for stripping scripts from layouts](hideRuntimeOutput.md)

[Read transpile.md for compilation pipelines](transpile.md)
