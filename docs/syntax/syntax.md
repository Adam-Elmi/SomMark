# SomMark Syntax Reference Guide (v4.1.0)

SomMark is a structured, block-based markup language. The grammar is parsed using a clean, robust, and highly predictable token vocabulary. Below is the factual reference for every syntax construct supported in SomMark.

---

## 1. Blocks `[ ]`

Blocks are the primary structural building blocks of SomMark templates.

### Standard Blocks
Standard blocks must always have a matching `[end]` block. They can contain nested text nodes, comments, variables, and child blocks.
* **Syntax**: `[tag] body [end]`
* **Example**:
  ```ini
  [div]
    [h1]Hello World[end]
  [end]
  ```

### Self-Closing Blocks `!`
Self-closing blocks close immediately. They cannot contain body content or a matching `[end]`.
* **Syntax**: `[tag!]` or `[tag = props!]`
* **Example**:
  ```ini
  [br!]
  [hr = class: "separator" !]
  [img = src: "logo.png", alt: "Website Logo" !]
  ```

---

## 2. Block Props `=`

Props are passed to blocks following an `=` sign. Multiple props are separated by commas.

### Prop Resolution Formats:
* **Positional**: Bare values parsed in sequential order:
  ```ini
  [div = "container", "fluid"][end]
  ```
* **Named**: Expressed as `key: value` pairs:
  ```ini
  [button = color: "blue", size: "large"][end]
  ```
* **Mixed**: Combining positional and named props together:
  ```ini
  [card = "shadow", title: "Product Features"][end]
  ```

### Prop Value Types:
* **Quoted Strings**: Traditional text parameters: `[tag = name: "Value"][end]`
* **Native JavaScript Data (`js{}`)**: Safely parsed arrays, numbers, booleans, and objects:
  ```ini
  [chart = data: js{[10, 20, 30]}, responsive: js{true}][end]
  ```
* **Public Placeholders (`p{}`)**: Dynamically resolved from the global compilation config:
  ```ini
  [user = name: p{currentUsername}][end]
  ```
* **Local Variables (`v{}`)**: Resolved from variables bound directly to components or local scopes:
  ```ini
  [details = id: v{userId}][end]
  ```
* **Static Evaluation Blocks (`static ${}`)**: Run JavaScript inside the VM sandbox at compilation-time and binds the evaluated return value:
  ```ini
  [div = year: static ${ new Date().getFullYear() }$][end]
  ```
* **Runtime Blocks (`runtime ${}`)**: Evaluates runtime logic scripts or hooks preserved in the target output:
  ```ini
  [button = onClick: runtime ${ alert("Clicked!") }$][end]
  ```

---

## 3. Inline Elements `( )->( )`

Inlines are used for formatting text spans directly inside a paragraph block. Inlines do not support nested block syntax inside their body brackets.
* **Syntax**: `(text)->(id)` or `(text)->(id = props)`
* **Example**:
  ```ini
  This is (bold text)->(bold).
  Visit (our website)->(link = "https://sommark.org").
  ```

---

## 4. At-Blocks `@_id_@: props; ... @_end_@`

At-Blocks capture raw, un-parsed text content. Brackets, comment indicators, and tags inside At-Blocks are treated as literal text and will not be parsed by the compiler.
* **Syntax**:
  ```ini
  @_id_@;
    literal body text
  @_end_@
  ```
* **Syntax with Props**:
  ```ini
  @_code_@: lang: "javascript";
    const message = "Literal [brackets] are ignored here!";
  @_end_@
  ```

---

## 5. Comments `#`

Comments are completely removed by the compiler during parsing and never appear in the compiled output (unless comment removal is explicitly disabled).

* **Single-line Comments**: Start with `#` and run until the end of the line:
  ```ini
  # This is a single-line comment
  ```
* **Multiline Comments**: Wrapped in matching `###` blocks (no leading spaces allowed around the start/end markers):
  ```ini
  ###
    This is a multiline comment.
    It can span multiple lines.
  ###
  ```

---

## 6. Logic Blocks `static ${...}$` and `runtime ${...}$`

Logic blocks execute JavaScript inside the sandboxed virtual machine or target environment.

### Static Blocks
Evaluates JavaScript on the server during template compilation and replaces the block inline with the evaluated result.
*   **Syntax**:
    ```js
    static ${ /* JS expression or script */ }$
    ```
*   **Usage**:
    ```mdx
    Get SomMark version: static ${ SomMark.version }$
    ```
*   **Reference**: Read the [Static Blocks Guide](static-block.md) for complete details.

### Runtime Blocks
*   **Definition**: Preserves client-side JavaScript logic intact inside the compiled output document to be executed in the target runtime environment.
*   **Syntax**:
    ```js
    runtime ${ /* JS code */ }$
    ```
*   **Usage**:
    ```mdx
    [button]
      runtime ${ 
        self.addEventListener("click", () => alert("Hello")) 
      }$
      Click Me
    [end]
    ```
*   **Reference**: Read the [Runtime Blocks Guide](runtime-block.md) for complete details.

---

## 7. Structural Loop Block (`[for-each]`)

Loops through an array of items and renders the inner body block repeatedly:
* **Syntax**: `[for-each = static ${ itemsArray }$, as: "alias"] body [end]`
* **Loop Context Variables**:
  * `static ${ alias }$`: Holds the active item object or property (e.g. `static ${ alias.name }$`).
  * `static ${ alias_index }$`: Holds the 0-indexed count of the current loop iteration.
* **Example**:
  ```ini
  [for-each = static ${ [ { name: "A", id: 1 }, { name: "B", id: 2 } ] }$, as: "user"]
    [span]Name: static ${ user.name }$, ID: static ${ user.id }$, Index: static ${ user_index }$ [end]
  [end]
  ```

---

## 8. Module Declaration & Component Blocks

The Smark module system splits large pages into small reusable blocks:

* **Import Declaration**: Must reside at the absolute top of the file:
  ```ini
  [import = Card: "./components/Card.smark"][end]
  ```
* **Static Injection**:
  ```ini
  [$use-module = Card][end]
  ```
* **Component Block Injection**: Invokes the sub-module as a block, passing props and custom layout body content:
  ```ini
  [Card = title: "Featured Product"]
    This is the card layout inner body.
  [end]
  ```
* **Dynamic Slot Injection (`[slot]`)**: Inside the component file (e.g. `Card.smark`), defines where nested body content will inject:
  ```ini
  [div = class: "card"]
    [h2]v{title}[end]
    [div = class: "card-body"]
      [slot][end]
    [end]
  [end]
  ```

---

## 9. Comprehensive Example

```ini
[import = Card: "./components/Card.smark"][end]

[div = class: "container"]
  [h1]SomMark Engine v4.1.0[end]
  
  # Structural Page Section
  [section = id: "intro"]
    ### 
      This section executes a loop to output a list 
      of cards with localized index variables.
    ###
    
    [for-each = 
    static ${ 
        [ { name: "Red", hex: "#F00" },
          { name: "Green", hex: "#0F0" },
          { name: "Blue", hex: "#00F" }
        ] }$, 
        as: "color"]
      [Card = title: static ${ color.name }$]
        Color hex code: static ${ color.hex }$
        Current Position: static ${ color_index }$
      [end]
    [end]
    [end]
  
  [hr!]
  
  # This is a raw code block, not a SomMark block, output as raw text: [div !] \# This is self-closing 
  @_code_@: lang: "smark";
    [div!] # This is self-closing
  @_end_@
[end]
```
