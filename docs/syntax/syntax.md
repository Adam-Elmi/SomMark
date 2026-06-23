# SomMark Syntax Reference Guide (v5)

SomMark is a structured, block-based markup language. Below is the reference for every syntax construct in SomMark.

---

## 1. Blocks `[ ]`

Blocks are the main building blocks of SomMark templates.

### Standard Blocks
Standard blocks have a matching `[end:name]`. They can contain text, comments, variables, and other blocks.
* **Syntax**: `[name] body [end:name]`
* **Example**:
  ```ini
  [div]
    [h1]Hello World[end:h1]
  [end:div]
  ```

### Self-Closing Blocks `!`
Self-closing blocks have no body and no `[end]`.
* **Syntax**: `[name!]` or `[name = props!]`
* **Example**:
  ```ini
  [br!]
  [hr = class: "separator" !]
  [img = src: "logo.png", alt: "Website Logo" !]
  ```

---

## 2. Block Props `=`

Props are values passed into a block after the `=` sign. Multiple props are separated by commas.

### Prop Formats:
* **Positional**: Values listed in order:
  ```ini
  [div = "container", "fluid"][end:div]
  ```
* **Named**: `key: value` pairs:
  ```ini
  [button = color: "blue", size: "large"][end:button]
  ```
* **Mixed**: Positional and named together:
  ```ini
  [card = "shadow", title: "Product Features"][end:card]
  ```

### Prop Value Types:
* **Quoted Strings**: Plain text values in quotes:
  ```ini
  [id = name: "Value"][end:id]
  ```
* **Public Placeholders (`p{}`)**: Values from the global compile config:
  ```ini
  [user = name: p{currentUsername}][end:user]
  ```
* **Local Variables (`v{}`)**: Values from the current component or loop:
  ```ini
  [details = id: v{userId}][end:details]
  ```
* **Compile-Time Blocks (`${}`)**: Run JavaScript at build time and use the result as a prop value. The `static` keyword is optional — `${ expr }$` and `static ${ expr }$` are the same:
  ```ini
  [div = year: ${ new Date().getFullYear() }$][end:div]
  ```
* **Runtime Blocks (`runtime ${}`)**: Keep JavaScript in the output, to run in the browser:
  ```ini
  [button = onClick: runtime ${ alert("Clicked!") }$][end:button]
  ```

---

## 3. Comments `#`

Comments are removed at build time and never appear in the output.

* **Single-line Comments**: Start with `#` and end at the end of the line:
  ```ini
  # This is a single-line comment
  ```
* **Multiline Comments**: Wrapped in matching `###` blocks:
  ```ini
  ###
    This is a multiline comment.
    It can span multiple lines.
  ###
  ```

---

## 4. Compile-Time and Runtime Blocks

### Compile-Time Block `${ ... }$`
Runs JavaScript on the server during the build and puts the result inline in the output. The `static` keyword is optional — `${ expr }$` and `static ${ expr }$` are exactly the same:
* **Syntax**:
  ```js
  ${ /* JS expression or statement */ }$
  ```
* **Usage**:
  ```ini
  Built on: ${ new Date().toISOString() }$
  ```
* **Reference**: See the [Compile-Time Blocks Guide](static-block.md) for full details.

### Runtime Block `runtime ${ ... }$`
Keeps the JavaScript in the final output to run in the browser:
* **Syntax**:
  ```js
  runtime ${ /* JS code */ }$
  ```
* **Usage**:
  ```ini
  [button]
    runtime ${
      self.addEventListener("click", () => alert("Hello"))
    }$
    Click Me
  [end:button]
  ```
* **Reference**: See the [Runtime Blocks Guide](runtime-block.md) for full details.

---

## 5. Raw Body Blocks `smark-raw`

The `smark-raw` prop tells SomMark to skip parsing the block's body. Everything between the opening and closing tag is passed to the render function as `content`, exactly as written.

* **Syntax**: `[name = smark-raw: true] raw body [end:name]`
* **Use cases**: embedding literal markup, fenced code blocks, CDATA, or any content that contains `[` characters that should not be treated as SomMark.
* **Example**:
  ```ini
  [code = lang: "js", smark-raw: true]
  const nums = [1, 2, 3];
  [end]
  ```
* Use `\[` to write a literal `[` that would otherwise be read as `[end]`.
* The `smark-raw` prop is stripped before reaching the render function. All other props are passed through normally.
* **Reference**: See the [smark-raw Guide](smark-raw.md) for full details.

---

## 6. For-Each Loop `[for-each]`

Loops through an array and renders the body once for each item. The `static` keyword is optional on the array expression:

* **Syntax**: `[for-each = ${ itemsArray }$, as: "alias"] body [end:for-each]`
* **Loop Variables**:
  * `${ alias }$`: The current item (e.g. `${ alias.name }$`). Defaults to `value` if no `as:` is set.
  * `${ i }$`: The 0-based position of the current item. Always `i` — not customizable.
* **Example**:
  ```ini
  [for-each = ${ [ { name: "A", id: 1 }, { name: "B", id: 2 } ] }$, as: "user"]
    [span]Name: ${ user.name }$, ID: ${ user.id }$, Index: ${ i }$[end:span]
  [end:for-each]
  ```

---

## 7. Module System

The SomMark module system lets you split large templates into smaller, reusable files:

* **Import Declaration**: Must be at the very top of the file, before any content:
  ```ini
  [import = Card: "./components/Card.smark" !]
  ```
* **Static Injection** — insert a module as-is, no props:
  ```ini
  [$use-module = Card !]
  ```
* **Component Block** — pass props and body content into the module:
  ```ini
  [Card = title: "Featured Product"]
    This is the card body content.
  [end:Card]
  ```
* **Slot** — inside a component file, marks where the caller's body content goes:
  ```ini
  [div = class: "card"]
    [h2]v{title}[end:h2]
    [div = class: "card-body"]
      [slot][end:slot]
    [end:div]
  [end:div]
  ```

---

## 8. Complete Example

```ini
[import = Card: "./components/Card.smark" !]

${
  const colors = [
    { name: "Red", hex: "#F00" },
    { name: "Green", hex: "#0F0" },
    { name: "Blue", hex: "#00F" }
  ];
}$

[div = class: "container"]
  [h1]SomMark v5[end:h1]

  # Page section with a loop
  [section = id: "intro"]
    ###
      This section loops through colors
      and renders a card for each one.
    ###

    [for-each = ${ colors }$, as: "color"]
      [Card = title: ${ color.name }$]
        Color hex code: ${ color.hex }$
        Position: ${ i }$
      [end:Card]
    [end:for-each]
  [end:section]

  [hr!]
[end:div]
```
