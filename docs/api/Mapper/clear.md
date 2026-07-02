# clear()

Clears the `outputs` registry of a mapper.

---

**Syntax:**
```js
mapper.clear();
```

**Usage:**
```js
import { HTML } from "sommark";
// creates a clone of html mapper
const mapper = HTML.clone();
// Clears all registered outputs but keeps internal functions and behaviors like getUnknownTag(), etc.
mapper.clear();
```

---

### Example: Behavior on Cloned HTML Mapper

Cloned mappers retain their `getUnknownTag` fallback method:

```javascript
import SomMark, { MARKDOWN } from "sommark";

const customMapper = MARKDOWN.clone();
/*
Markdown Mapper:
Input: [h1]Hello[end:h1]
Output: # Hello
*/
console.log(await SomMark.transpile({
  src: "[h1]Hello[end:h1]",
  format: "markdown",
  mapperFile: customMapper
}));
// Output: # Hello 
// console.log(customMapper.outputs) // TO SEE WHAT IT LOOKS BEFORE CLEARING
customMapper.clear(); // Clears outputs array
// console.log(customMapper.outputs) // TO SEE WHAT IT LOOKS AFTER CLEARING

/*
[h1] is a registered output in the Markdown mapper, so when clear is called, it removes the mapping of [h1], so it falls back to getUnknownTag. In the Markdown mapper, getUnknownTag returns unknown blocks as HTML elements.
*/
console.log(await SomMark.transpile({
  src: "[h1]Hello[end:h1]",
  format: "markdown",
  mapperFile: customMapper
})); 
// Output: <h1>Hello</h1>
```

[Read mapperFile.outputs for more info](outputs.md)

[Read getUnknownTag.md for more info](getUnknownTag.md)