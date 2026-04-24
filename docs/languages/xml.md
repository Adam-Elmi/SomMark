# XML Mapping Guide

The **XML Mapper** converts SomMark into strictly formatted XML 1.0. This is ideal for technical workflows, data storage, and legacy integrations.

> [!TIP]
> SomMark simplifies the "verbosity" of XML while guaranteeing that every file generated is perfectly well-formed.

## 1. Using XML

Request the XML format using named exports:

```javascript
import { XML } from "sommark";

const xml = await transpile({ src, format: "xml" });
```

---

## 2. Strict XML Standards

SomMark's XML mapper enforces the rules of XML 1.0:
- **Single Root**: Documents must have exactly one root element.
- **Case Sensitivity**: XML Identifiers are **Case-Sensitive**. `[Note]` is different from `[note]`.
- **Mandatory Values**: Every attribute MUST have a value. In XML mode, SomMark ignores boolean attributes without values.
- **Attribute Filtering**: Explicit named arguments are mapped to XML attributes. Positional arguments (indices) are automatically filtered out to ensure well-formed XML metadata.

---

## 3. Specialized XML Blocks

### XML Prolog
Use the `[xml]` block to inject the standard XML declaration. It defaults to version `1.0` and `UTF-8` encoding if arguments are omitted.
```re
[xml][end]
[xml = version: "1.0", encoding: "UTF-8"][end]
```
**Output:** `<?xml version="1.0" encoding="UTF-8"?>`

### Stylesheets & DOCTYPE
- **Stylesheets**: `[xml-stylesheet = href: "style.xsl"][end]` (Defaults to `type: "text/xsl"`)
- **DOCTYPE**: 
    - Internal: `[doctype = root: "note", system: "note.dtd"][end]`
    - Public: `[doctype = root: "svg", public: "-//W3C//DTD SVG 1.1//EN", system: "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"][end]`

---

## 4. XML Namespaces

You can use standard XML namespaces by defining them with `xmlns`.

```re
[h:table = "xmlns:h": "http://www.w3.org/TR/html4/"]
  [h:tr]
    [h:td]Apples[end]
  [end]
[end]
```

---

## 5. CDATA Sections

For raw content that should not be parsed (like code or raw HTML strings), use the `@_cdata_@` At-Block.

```ini
@_cdata_@;
  if (a < b && b < c) { ... }
@_end_@
```
**Output:** `<![CDATA[if (a < b && b < c) { ... }]]>`

---

## 6. Why use SomMark for XML?

XML is historically verbose and difficult to maintain manually. SomMark provides a modern authoring layer that eliminates the common pitfalls of raw XML.

### 1. Zero-Syntax Errors (Smart Tag Management)
Raw XML will crash if a single tag is not properly closed or mismatched. SomMark automatically decides whether to use a self-closing tag (`<tag />`) or an open/close pair based on your content. This guarantees your XML is always well-formed.

### 2. Modular XML Construction
Standard XML does not have a simple way to include other files. With SomMark, you can use `[import]` and `[$use-module]` to build complex XML documents from separate, reusable `.smark` templates.

### 3. Attribute Security
In raw XML, every attribute must be properly quoted. SomMark handles all attribute quoting automatically and filters out unintentional arguments (positional arguments), ensuring your file's attributes are always compliant with XML standards.

---

## 7. Pro Tips

1.  **Automatic Closing**: SomMark automatically uses the self-closing syntax (`<tag />`) for any block that has no content.
2.  **Safe Characters**: Symbols like `&` and `<` are automatically escaped to their safe XML counterparts (`&amp;`, `&lt;`).
3.  **No Fallback**: Unlike Markdown or HTML, the XML mapper DOES NOT support the "Smart Styling Fallback." Every argument is treated as a literal XML attribute.
