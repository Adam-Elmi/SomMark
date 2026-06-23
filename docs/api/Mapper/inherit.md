# inherit()

Inherits all registered block outputs from one or more other mappers.

---

**Syntax:**
```js
mapper.inherit(...mappers)
```

**Usage:**
```js
import { Mapper, HTML } from "sommark";
const myMapper = new Mapper();

// Copy all standard HTML block configurations into myMapper
myMapper.inherit(HTML);
```

---

### Example: Combining Multiple Mappers (Last-Match-Wins)

You can inherit from multiple mappers in a single call. If the same block is defined in multiple mappers, the one registered **last** takes precedence:

```js
import { Mapper, HTML, MARKDOWN } from "sommark";
const myMapper = new Mapper();

// Both HTML and MARKDOWN have a 'bold' block.
// Because MARKDOWN is listed last, its 'bold' renderer is used.
myMapper.inherit(HTML, MARKDOWN);
```

---

### Example: Extending a Standard Mapper

Inherit standard blocks as a baseline, then register your own custom blocks to extend its capabilities:

```js
import { Mapper, HTML } from "sommark";
const myMapper = new Mapper();

// 1. Inherit all registered blocks from the HTML mapper: HTML.outputs
myMapper.inherit(HTML);

// 2. Add custom blocks on top
myMapper.register("card", function({ content }) {
    return this.tag("div").attributes({ class: "card" }).body(content);
});
```

### Example: Overriding Duplicate Blocks

Mappers are copied from left to right. If multiple mappers have the same block, the last one overrides previous ones by automatically cleaning up duplicates under the hood:

```js
import { Mapper } from "sommark";

const mapperA = new Mapper();
mapperA.register("bold", ({content}) => this.tag("strong").body(content));

const mapperB = new Mapper();
mapperB.register("bold", ({content}) => this.tag("b").body(content));

const finalMapper = new Mapper();
// Copies mapperA, then mapperB overrides "bold"
finalMapper.inherit(mapperA, mapperB);
```
