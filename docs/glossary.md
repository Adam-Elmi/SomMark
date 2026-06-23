# SomMark Glossary


## Mapper

A mapper is an object that tells SomMark how to turn blocks into output. Each block in a template is looked up in the active mapper, which runs a render function and returns the final string for that block.

The mapper owns everything that is format-specific:

- **Block rendering** — what each block produces in the output
- **Text escaping** — the HTML mapper escapes `<` and `&`; the Markdown mapper escapes `*` and `_`; the JSON mapper leaves text as-is
- **Comment output** — when `removeComments: false`, each mapper decides the comment format (`<!-- -->` in HTML, `//` in JSONC, etc.)
- **Unknown block fallback** — `getUnknownTag` defines what happens when a block has no registration

SomMark ships with built-in mappers:

| Mapper     | Output format      |
|------------|--------------------|
| `HTML`     | HTML               |
| `Markdown` | Markdown / GFM     |
| `MDX`      | MDX                |
| `JSON`     | JSON               |
| `JSONC`    | JSON with comments |
| `XML`      | XML                |
| `CSV`      | CSV                |
| `Text`     | Plain text         |

### Using a mapper

```js
// Built-in via format shorthand
const sm = new SomMark({ src, format: "html" });

// Custom mapper passed directly
const sm = new SomMark({ src, mapperFile: myMapper });
```

### Creating a custom mapper

Clone a built-in to extend it without changing the original:

```js
import { HTML } from "sommark";

const myMapper = HTML.clone();
myMapper.register("card", ({ content }) => `<div class="card">${content}</div>`);
```

Start from scratch with `Mapper.define()`:

```js
import { Mapper } from "sommark";

const myMapper = Mapper.define({
    text(text) { return text; },
    comment(text) { return `; ${text}`; }
});
```

Pull registrations from another mapper with `inherit()`:

```js
myMapper.inherit(HTML);
```

---

*More terms coming soon.*
