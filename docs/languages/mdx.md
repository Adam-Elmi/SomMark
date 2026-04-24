# MDX Mapping Guide

**MDX** allows you to mix SomMark syntax with JSX components. This is perfect for modern React frameworks like Next.js, Astro, or Remix.

## 1. Using MDX

Register the MDX mapper using named exports:

```javascript
import { MDX } from "sommark";

const mdx = await transpile({ src, format: "mdx" });
```

---

## 2. The Hybrid Engine

The MDX Mapper follows the **Best of Both Worlds** logic:
1.  **Markdown Basics**: Normal text, bold, italics, and headings are converted into clean Markdown.
2.  **JSX Power**: Any Identifier that doesn't have a Markdown equivalent (like `[MyComponent]`) is automatically rendered as a JSX component.

```ini
[Card = title: "Welcome"]
  This is a regular Markdown sentence.
[end]
```
**Output:**
```jsx
<Card title="Welcome">
  This is a regular Markdown sentence.
</Card>
```

---

## 3. Unregistered Identifiers

If an Identifier is not registered in the MDX mapper, it will be rendered as a JSX component.

```ini
[MyComponent = prop: "val"] Content [end]
```
**Output:**
```jsx
<MyComponent prop="val"> Content </MyComponent>
```
This is useful for custom components that are not registered in the MDX mapper. You do not need to register every component in the MDX mapper. 

---

## 4. Re-registering Identifiers

You may want to re-register an identifier to change its behavior in MDX. For example, to render a custom component instead of a standard HTML element.

```js
import { MDX, transpile } from "sommark";

const modifiedMdx = MDX.clone();
modifiedMdx.register("Text", function({ args, content }) {
    return this.tag("Text")
        .jsxProps(args) 
        .body(content);
});

const src = `
[Text = title: "Welcome", gradient: js{{colors: ["red", "green", "blue"]}}]
  This is a regular Markdown sentence.
[end]
`;

const mdx = await transpile({ src, format: "mdx", mapperFile: modifiedMdx });

console.log(mdx);
```

---

## 5. Professional JSX Rendering (`jsxProps`)

When building custom mappers for MDX, use the `.jsxProps(args)` helper. It handles technical formatting like `className` conversion, automated style objects, and JSX expression wrapping.

```javascript
myMapper.register("Graph", function({ args }) {
    // .jsxProps() turns positional/named args into JSX props
    return this.tag("Graph")
        .jsxProps(args) 
        .selfClose();
});
```

---

## 6. Raw JSX
For raw JSX you can use the `@_mdx_@` Atblock.

```r
@_mdx_@;
import { MyComponent } from "./MyComponent";
export const theme = "dark";
@_end_@

[Card = title: "Welcome", theme: {theme}]
  This is a card.
[end]

```

This will render as:

```mdx
import { MyComponent } from "./MyComponent";
export const theme = "dark";

<Card title="Welcome" theme={theme}>This is a card. {theme}</Card>
```

Use this for any JSX code you want to use in your MDX files. This includes importing components, defining variables, and using any other JSX syntax.



## 7. Why use SomMark for MDX?

The primary advantage of using SomMark for MDX is **Syntax Flexibility**. MDX is notoriously strict about whitespace and tag placement, leading to frequent build errors that are hard to debug.

### 1. Flexible Whitespace Management
MDX often fails if your Markdown text is on the same line as a JSX tag, or if you have incorrect spacing between components. SomMark handles all these layout requirements for you during transpilation.

**Problematic MDX:**
```mdx
<MyComponent> This may cause a syntax error
</MyComponent>
```

```mdx
<MyComponent> 
 Also this will cause a syntax error in MDX because content is at same line as the closing tag.</MyComponent>
```
In SomMark you can write it as you want, there is no strict syntax for the content:

```re
[MyComponent] You can write your content on the same line, no problem.[end]
```

```re
[MyComponent] 
  This is will not cause a syntax error in MDX because SomMark handles the formatting of the content.[end]
```

