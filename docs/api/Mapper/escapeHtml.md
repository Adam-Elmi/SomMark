# escapeHTML()

A utility method that makes a raw string safe for HTML by replacing special characters with HTML entities.

---

**Syntax**

```javascript
mapper.escapeHTML(string);
```


---

### Key Behaviors

* **Character Replacements**: 
  * `&` $\rightarrow$ `&amp;`
  * `<` $\rightarrow$ `&lt;`
  * `>` $\rightarrow$ `&gt;`
  * `"` $\rightarrow$ `&quot;`
  * `'` $\rightarrow$ `&#39;`

---

### Example: Basic Escaping

You can manually escape unsafe text using a mapper instance:

```javascript
import { HTML } from "sommark";

const unsafe = '<h1> "Smark" & SomMark </h1>';
const safe = HTML.escapeHTML(unsafe);

console.log(safe);
// Output: &lt;h1&gt; &quot;Smark&quot; &amp; SomMark &lt;/h1&gt;
```

---

### Example: Escaping Inside a Custom Tag

Use `.escapeHTML()` inside your custom tag renderers to safely handle user-supplied content:

```javascript
import SomMark, { HTML } from "sommark";

const customMapper = HTML.clone();

// Register a span tag that manually escapes its content
customMapper.register("safe-span", function({ content }) {
  const cleanContent = this.escapeHTML(content);
  return this.tag("span").body(cleanContent);
}, { escape: false }); // Disable automatic engine escaping to handle it manually

console.log(await SomMark.transpile({
  src: '[safe-span]To create a heading in HTML, use the <h1> tag.[end]',
  format: "html",
  mapperFile: customMapper
}));
// Output: <span>To create a heading in HTML, use the &lt;h1&gt; tag.</span>
```

[Read getUnknownTag.md to understand fallback rendering](getUnknownTag.md)

[Read includesId.md to check if a tag is registered](includesId.md)
