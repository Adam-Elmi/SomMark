# mapperFile

A custom `Mapper` instance that defines block compilation rules for the engine.

---

**Syntax:**
```js
// 1. In engine options
new SomMark({ src, format, mapperFile })

// 2. In transpile options
transpile({ src, format, mapperFile })
```

**Usage:**
```js
import { transpile, Mapper } from "sommark";

const customMapper = new Mapper();
customMapper.register("h1", ({ body }) => `<h1>${body}</h1>`);

const output = await transpile({
  src: "[h1]Hello World[end:h1]",
  format: "html",
  mapperFile: customMapper
});
console.log(output);
// Output: <h1>Hello World</h1>
```

---

### Example: Default Mapper Inheritance

You can clone and customize a built-in language mapper instead of writing one from scratch:

```javascript
import { transpile, HTML } from "sommark";

// Clone default HTML mapper
const myMapper = HTML.clone();

// Override only the 'p' block definition
myMapper.register("p", ({ body }) => `<p class="lead">${body}</p>`);

const output = await transpile({
  src: "[p]Custom lead paragraph[end:p]",
  format: "html",
  mapperFile: myMapper
});
console.log(output);
// Output: <p class="lead">Custom lead paragraph</p>
```

[Read clear.md for cleaning custom mappers](../Mapper/clear.md)

[Read register.md for registering new blocks](../Mapper/register.md)
