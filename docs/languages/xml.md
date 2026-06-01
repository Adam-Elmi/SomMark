# XML Mapping Guide

The **XML Mapper** converts SomMark structural hierarchies into strictly well-formed, compliant XML 1.0 documents. This is ideal for data interchanges, config generation, RSS feeds, and integration with legacy semantic workflows.

> [!TIP]
> SomMark completely eliminates the repetitive verbosity of raw XML markup, while guaranteeing that every document compiled is syntactically well-formed.

---

## 1. Using XML

To compile your templates into strictly compliant XML, initialize the transpilation pipeline with the `"xml"` format:

```javascript
import SomMark from "sommark";

const sm = new SomMark({
  src: sourceText,
  format: "xml"
});

const xmlString = await sm.transpile();
```

---

## 2. Strict XML 1.0 Standards

The XML Mapper (`mappers/languages/xml.js`) enforces strict structural regulations compliant with the XML 1.0 specification:

*   **Single Root Rule**: Valid XML documents must contain exactly one root element.
*   **Case Sensitivity**: XML identifiers are strictly case-sensitive. The block `[Note] ... [end]` produces `<Note> ... </Note>`, which is distinct from `[note] ... [end]` (`<note> ... </note>`).
*   **Mandatory Values**: XML attributes must always have explicit double-quoted string values. Smark co-enforces this rule; any boolean arguments without explicit values are cleanly ignored.
*   **Positional Attribute Filtering**: XML does not support positional elements. Any numeric positional arguments passed in headers are automatically filtered out, ensuring only named key-value arguments are compiled as standard XML attributes.
*   **Automatic Self-Closing tags**: XML requires empty tags to close immediately. If a block is empty (contains no body content or child nodes), Smark automatically transpiles it to self-closing syntax (e.g. `<tag />`), preventing build crashes.

**SomMark Source:**
```ini
[h:table = "xmlns:h": "http://www.w3.org/TR/html4/", border: "1"]
  [h:tr]
    [h:td]Apples[end]
    [h:td = class: "empty-cell" !]
  [end]
[end]
```
**XML Output:**
```xml
<h:table xmlns:h="http://www.w3.org/TR/html4/" border="1">
  <h:tr>
    <h:td>Apples</h:td>
    <h:td class="empty-cell" />
  </h:tr>
</h:table>
```

---

## 3. Registered Outputs & Layout Utilities

The XML mapper explicitly registers several specialized tags to output compliant declarations, processing instructions, and unparsed character blocks.

### 1. `[xml]` (XML Declaration / Prolog)
- **Type**: Block (Self-closing / Empty body enforced)
- **Purpose**: Generates the standard XML prolog declaration. 
- **Parameters**:
  - `version` *(defaults to `"1.0"`)*: Specifies the XML standard version.
  - `encoding` *(defaults to `"UTF-8"`)*: Specifies the character encoding format.
- **Example**:
  ```ini
  [xml = version: "1.0", encoding: "UTF-8"][end]
  ```
  **Output XML**:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  ```

### 2. `[DOCTYPE]` / `[doctype]`
- **Type**: Block (Self-closing / Empty body enforced)
- **Purpose**: Injects the Document Type Declaration (DTD).
- **Parameters**:
  - `root` *(defaults to `"root"`)*: The name of the root element.
  - `system`: Path to the local DTD file (SYSTEM).
  - `public` / `fpi`: Public formal path identifier (PUBLIC).
- **Example (System DTD)**:
  ```ini
  [doctype = root: "note", system: "note.dtd"][end]
  ```
  **Output XML**:
  ```xml
  <!DOCTYPE note SYSTEM "note.dtd">
  ```
- **Example (Public DTD)**:
  ```ini
  [doctype = root: "svg", public: "-//W3C//DTD SVG 1.1//EN", system: "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"][end]
  ```
  **Output XML**:
  ```xml
  <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
  ```

### 3. `[xml-stylesheet]`
- **Type**: Block (Self-closing / Empty body enforced)
- **Purpose**: Injects XSL stylesheet processing instructions to style XML documents in the browser.
- **Parameters**:
  - `href` *(Required)*: Path to the XSL styling stylesheet.
  - `type` *(defaults to `"text/xsl"`)*: The stylesheet MIME type.
- **Example**:
  ```ini
  [xml-stylesheet = href: "style.xsl"][end]
  ```
  **Output XML**:
  ```xml
  <?xml-stylesheet type="text/xsl" href="style.xsl"?>
  ```

### 4. `@_cdata_@` CDATA Block
- **Type**: AtBlock (Unescaped)
- **Purpose**: Generates CDATA sections to preserve raw text block segments (like source code, XML syntax templates, or mathematical expressions) without triggering parser checks or escaping active characters like `&` and `<`.
- **Example**:
  ```js
  @_cdata_@;
    if (a < b && b < c) { console.log(true); }
  @_end_@
  ```
  **Output XML**:
  ```xml
  <![CDATA[if (a < b && b < c) { console.log(true); }]]>
  ```

### 5. `raw` AtBlock
- **Type**: AtBlock (Unescaped)
- **Purpose**: Bypasses the parser and escaping layer entirely to inject raw, unescaped XML segments.
- **Example**:
  ```mdx
  @_raw_@;
    <raw-unparsed-data>Untouched</raw-unparsed-data>
  @_end_@
  ```

---

## 4. Why use SomMark for XML?

1.  **Strict Comma and Quote Security**: XML requires every single attribute to be properly quoted and defined. SomMark manages all attribute escaping, double quoting, and validation automatically, preventing simple structural validation errors.
2.  **Modular Template Inclusion**: Standard XML lacks native inclusion capabilities. SomMark allows you to organize massive configurations into separate `.smark` templates and dynamically merge them using standard `[import]` and `[$use-module]` components at build-time.
3.  **Compile-Time Variable Injection**: Inject dynamic data, calculations, or server stats securely into XML configurations at compilation using native sandboxed `static ${ ... }$` blocks.
4.  **Automatic Entity Escaping**: SomMark automatically escapes active XML characters (such as `&` to `&amp;` and `<` to `&lt;`) in body text nodes, ensuring your output never fails standard schema validation.
5.  **Compile-Time JS Execution**: Run sandboxed JavaScript at compile-time to dynamically fetch external API data, calculate complex values, or inject build timestamps into your XML.