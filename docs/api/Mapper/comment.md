# comment() / commentBlock()

Defines how single-line (`#`) and multiline (`###`) Smark comments are formatted in the final output.

---

**Syntax:**
```js
mapper.comment(text)
mapper.commentBlock(text, indent)
```

**Usage:**
```js
import { Mapper } from "sommark";

const myMapper = new Mapper();

// Custom formatting for standard single-line comments
myMapper.comment = function(text) {
    return `<!-- ${text} -->`;
};

// Custom formatting for multiline block comments
myMapper.commentBlock = function(text, indent = "") {
    return `${indent}/* ${text} */`;
};
```

---

### Example: HTML Comment Rendering

By default, comments are ignored during transpilation. By setting `removeComments: false` in the options, they will be passed to these methods and rendered:

```javascript
import { transpile } from "sommark";

const mapper = HTML.clone();

const smarkSource = `
# Developer Notice: check performance
[div]
  ###
    This block contains the main hero section.
    Verify styling on mobile views.
  ###
  Hero Section Content
[end:div]
`;

const output = await transpile({
  src: smarkSource,
  format: "html",
  mapperFile: mapper,
  removeComments: false
});

console.log(output);
```

**Output:**
```html
<!-- Developer Notice: check performance -->
<div>
  <!-- This block contains the main hero section.
    Verify styling on mobile views. -->
  Hero Section Content
</div>
```

---

### Default Engine Behaviors
* **Comment Stripping:** By default, transpilation options set `removeComments` to `true`. Under this setting, comments are fully stripped at the transpiler level and never trigger these methods.
* **Base Return Value:** The base `Mapper` class returns an empty string `""` for both `comment` and `commentBlock` methods, meaning comments are hidden by default even if `removeComments` is set to `false`.
* **Block comments:** In the base `Mapper`, `commentBlock(text, indent)` delegates directly to `comment(text)`.

[Read transpile options for more info](../core/transpile.md)
