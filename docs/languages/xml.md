# XML Mapper

The XML Mapper converts SomMark blocks into valid XML 1.0. Use it for data exchange, RSS feeds, config files, and anything that reads XML.

---

## Advantages over Raw XML

| Feature | SomMark | Raw XML |
| :--- | :--- | :--- |
| **Module system** | `[import]` splits templates across files | XInclude is complicated and rarely supported |
| **Component system** | `[slot]` + `[import]` = reusable XML fragments | No components |
| **Compile-time logic** | `${}$` computes values at build time (`static` keyword is optional) | No logic |
| **Looping** | `[for-each]` generates repeated elements | No looping |
| **Placeholder injection** | `p{key}` / `v{key}` inject data at build time | No variables |
| **No extra setup code** | No namespace declarations unless you need them | Namespace and schema setup code in every file |
| **Auto escaping** | `&`, `<`, `>` in body text are escaped automatically | You must escape them manually |

---

## 1. Setup

```javascript
import SomMark from "sommark";

const sm = new SomMark({
  src: sourceText,
  format: "xml"
});

const xmlString = await sm.transpile();
```

---

## 2. XML Rules

These XML 1.0 rules are applied automatically:

- **One root element** — valid XML has exactly one root.
- **Case sensitive** — `[Note]` outputs `<Note>`, not `<note>`.
- **Quoted attributes** — all attribute values are double-quoted. Boolean attributes with no value are ignored.
- **Named attributes only** — unnamed (positional) props are dropped. XML requires every attribute to have a name.
- **Auto self-closing** — blocks with no body or children are output as self-closing elements.

```ini
[h:table = "xmlns:h": "http://www.w3.org/TR/html4/", border: "1"]
  [h:tr]
    [h:td]Apples[end]
    [h:td = class: "empty-cell" !]
  [end:h:tr]
[end:h:table]
```

```xml
<h:table xmlns:h="http://www.w3.org/TR/html4/" border="1">
  <h:tr>
    <h:td>Apples</h:td>
    <h:td class="empty-cell" />
  </h:tr>
</h:table>
```

---

## 3. Built-in Blocks

### `[xml]` — XML Declaration

Outputs the XML declaration line. Body must be empty.

Props:
- `version` — defaults to `"1.0"`
- `encoding` — defaults to `"UTF-8"`

```ini
[xml = version: "1.0", encoding: "UTF-8" !]
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
```

### `[DOCTYPE]` / `[doctype]` — Document Type

Props:
- `root` — root element name (defaults to `"root"`)
- `system` — path to a local DTD file (a file that defines what elements are allowed in this XML)
- `public` / `fpi` — a public name string that identifies the document type (rarely needed)

```ini
[doctype = root: "note", system: "note.dtd" !]
```

```xml
<!DOCTYPE note SYSTEM "note.dtd">
```

```ini
[doctype = root: "svg", public: "-//W3C//DTD SVG 1.1//EN", system: "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" !]
```

```xml
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
```

### `[xml-stylesheet]` — Stylesheet Link

Props:
- `href` (required) — path to the XSL stylesheet
- `type` — defaults to `"text/xsl"`

```ini
[xml-stylesheet = href: "style.xsl" !]
```

```xml
<?xml-stylesheet type="text/xsl" href="style.xsl"?>
```

### `[cdata]` — CDATA Section

Wraps content in a `<![CDATA[...]]>` section so special characters like `&` and `<` are not escaped.

Body form — for multi-line content:

```ini
[cdata]
  function greet() { return "Hello & World"; }
[end]
```

Self-closing — for short inline values:

```ini
[cdata = "Hello & World" !]
[cdata = text: "Hello & World" !]
```

```xml
<![CDATA[Hello & World]]>
```

---

## 4. Compile-Time Logic

Use `${}$` to compute values at build time (`static` keyword is optional):

```ini
[feed]
  [lastBuildDate]${ new Date().toUTCString() }$[end]
  [generator]SomMark v5[end]
[end:feed]
```

```xml
<feed>
  <lastBuildDate>Fri, 20 Jun 2026 12:00:00 GMT</lastBuildDate>
  <generator>SomMark v5</generator>
</feed>
```

---

## 5. File Splitting

Split large XML files across multiple `.smark` files and merge them at build time:

```ini
[import = header: "./xml-header.smark" !]

[root]
  [$use-module = "header" !]
  [item]First entry[end]
[end:root]
```
