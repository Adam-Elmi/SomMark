# MDX Mapper

The MDX Mapper converts SomMark blocks into MDX — a mix of Markdown and JSX used by React-based frameworks like Next.js, Astro, and Remix.

Core text (bold, italic, strikethrough, lists, tables) becomes standard Markdown. Everything else — custom components, layout blocks, HTML elements — becomes JSX.

---

## Advantages over MDX

MDX is the most similar format to SomMark. Both support imports, JS expressions, and components. SomMark's advantages are specific:

| Feature | SomMark | MDX |
| :--- | :--- | :--- |
| **No JSX syntax** | Consistent `[block]...[end]` for everything | JSX has strict whitespace and bracket rules that cause build errors |
| **No build setup needed** | Works standalone with Node.js | Needs a bundler like Vite, Next.js, or webpack to compile |
| **Multiple output formats** | Same source → HTML, XML, JSON, Markdown, text | Only targets React/HTML |
| **Safe compile-time JS** | `${}$` runs in a safe separate environment (QuickJS, `static` keyword is optional) | MDX expressions run in the same Node.js process — if something breaks, it can affect your whole server |
| **Built-in looping** | `[for-each]` where each loop has its own separate variables | No native loop |
| **Prefix blocks** | `p{key}` / `v{key}` for clean data injection | Raw JSX expressions `{value}` |
| **Works without React** | Outputs any format without needing a display tool | Needs React (or a compatible display tool) to show components |

---

## 1. How Blocks Map to MDX

If a block name is not registered, SomMark outputs it as a JSX element automatically. No need to register every component.

**SomMark:**
```ini
[Card = title: "Welcome"]
  This is a **Markdown** sentence inside a custom JSX component.
[end:Card]
```

**MDX Output:**
```jsx
<Card title="Welcome">
  This is a **Markdown** sentence inside a custom JSX component.
</Card>
```

Props that JSX does not understand as attributes (like CSS values) are moved into a `style={{}}` object:

```ini
[MyAlert = theme: "success", border: "1px solid green"]
  Operation completed successfully!
[end:MyAlert]
```

```jsx
<MyAlert theme="success" style={{border: "1px solid green"}}>
  Operation completed successfully!
</MyAlert>
```

---

## 2. Built-in Blocks

### `[h1]` to `[h6]`

Headings are output as JSX by default so props are kept. Use `format: "md"` to get plain Markdown `#` syntax.

```ini
[h1 = id: "main-title", className: "heading"]Main Title[end]
```

```html
<h1 id="main-title" className="heading">Main Title</h1>
```

```ini
[h1 = format: "md"]Plain Heading[end]
```

```markdown
# Plain Heading
```

### `[raw = smark-raw: true]`

Outputs content without any changes. Use it for raw MDX, ESM imports, exports, or any content that should not be processed:

```ini
[raw = smark-raw: true]
import { BarChart } from "@/components/BarChart";
export const title = "Metrics";
[end:raw]
```

```jsx
import { BarChart } from "@/components/BarChart";
export const title = "Metrics";
```

---

## 3. JSX Props (`jsxProps`)

When you add a custom block to the mapper, use `.jsxProps(props)` instead of writing the prop string by hand. It handles:

- **camelCase conversion**: `class` → `className`, `onclick` → `onClick`
- **Style objects**: CSS props become `style={{ fontSize: "14px" }}`

```javascript
import { MDX } from "sommark";

const customMdx = MDX.clone();
customMdx.register("UserProfile", function({ props }) {
  return this.tag("UserProfile")
    .jsxProps(props)
    .selfClose();
});
```

```ini
[UserProfile =
  name: "Sarah",
  avatar: "avatar.png",
  border: "1px solid blue"
!]
```

```jsx
<UserProfile name="Sarah" avatar="avatar.png" style={{border: "1px solid blue"}} />
```

---

## 4. Inherited Markdown Blocks

MDX inherits all block registrations from the Markdown mapper. This means blocks like `[code]`, `[table]`, `[list]`, `[blockquote]`, `[hr]`, and others produce **Markdown syntax**, not JSX:

```ini
[code = lang: "js"]
const x = 1;
[end:code]
```

```md
```js
const x = 1;
` ` `
```

If you want JSX output for these blocks instead, you have three options:

---

**Option 1 — Remove the inherited block**
Call `removeOutput()` on the block you want to override. Since MDX's `getUnknownTag` already produces JSX, removing the registration makes the block fall through to JSX automatically:

```js
import { MDX } from "sommark";

const myMdx = MDX.clone();
myMdx.removeOutput("code"); // now [code] falls through to getUnknownTag → JSX
```

```ini
[code = lang: "js"]const x = 1;[end:code]
```

```jsx
<code lang="js">const x = 1;</code>
```

---

**Option 2 — Re-register with your own render function**
Calling `register()` with an existing ID always replaces it — no need to call `removeOutput()` first:

```js
const myMdx = MDX.clone();

myMdx.register("code", function({ props, content }) {
    return this.tag("pre")
        .jsxProps({ "data-lang": props.lang })
        .body(this.tag("code").body(content));
});
```

---

**Option 3 — Start fresh with no inherited Markdown blocks**
If you want every block to produce JSX by default, build a new mapper from MDX's methods without calling `inherit()` at all. `getUnknownTag` already produces JSX for anything not registered, so unregistered blocks fall through automatically:

```js
import { Mapper, MDX } from "sommark";

const myMdx = Mapper.define({
    comment: MDX.comment.bind(MDX),
    getUnknownTag: MDX.getUnknownTag.bind(MDX),
    text: MDX.text.bind(MDX),
    options: { trimAndWrapBlocks: true }
});

// Everything else — [code], [table], [list], etc. — falls through to getUnknownTag → JSX automatically
```

---

> Always call `clone()` before modifying — `MDX` is a shared instance. Modifying it directly affects every compilation that uses the MDX format.

---

## 5. Auto-Escaping

MDX uses a different escaper from the Markdown mapper. The Markdown mapper uses backslash escapes (`\*`, `\1.`) which work because Markdown parsers strip the backslash. MDX renderers (Next.js, Astro, Remix) do not re-parse text inside JSX children as Markdown — so a backslash would render literally as `\1. Step 1`.

MDX escapes using **HTML entities** instead, which render correctly in any context:

| Input text | MDX output | Renders as |
|---|---|---|
| `**bold**` | `&#42;&#42;bold&#42;&#42;` | `**bold**` |
| `_italic_` | `&#95;italic&#95;` | `_italic_` |
| `~~strike~~` | `&#126;&#126;strike&#126;&#126;` | `~~strike~~` |
| `- list item` | `&#45; list item` | `- list item` |
| `1. ordered` | `1&#46; ordered` | `1. ordered` |
| `---` | `&#45;&#45;&#45;` | `---` |
| `<tag>` | `&lt;tag&gt;` | `<tag>` |
| `AT&T` | `AT&amp;T` | `AT&T` |

This happens automatically for all plain text — you do not need to do anything.

---

## 6. Whitespace

MDX is strict about whitespace and where closing brackets go. Having content on the same line as a closing JSX element often causes build errors:

```mdx
<Card>
  This can crash because content is on the same line as the closing tag.</Card>
```

SomMark handles all indentation and spacing automatically when it compiles. Both of these work fine:

```ini
[Card]You can write content on the same line.[end:Card]

[Card]
  Multiline content is padded correctly too.
[end:Card]
```
