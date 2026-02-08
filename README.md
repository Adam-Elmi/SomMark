<img width="2000" height="491" alt="SomMark Cover" src="https://raw.githubusercontent.com/Adam-Elmi/SomMark/master/assets/smark_bg.png" />

<p align="center">
  SomMark is a structural markup language designed for technical documentation. It focuses on explicit structure and flexibility.
</p>

<p align="center">
<img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />
<img src="https://img.shields.io/npm/v/sommark?style=flat-square" />
<img src="https://img.shields.io/badge/type-markup%20language-purple?style=flat-square" />
<img src="https://img.shields.io/badge/html-supported-orange?style=flat-square" />
<img src="https://img.shields.io/badge/markdown-supported-lightyellow?style=flat-square" />
<img src="https://img.shields.io/badge/mdx-supported-lightblue?style=flat-square" />
</p>

# SomMark v2

> [!WARNING]
> Old version(v1) is no longer supported.

SomMark provides a way to write structured content that can be converted into other formats like HTML or Markdown. It is different from standard Markdown because it uses explicit syntax for blocks and elements, which makes it easier to process and customize.

# Features

*   **Explicit Syntax**: Every element has a clear start and end, which reduces parsing errors.
*   **Customizable Mappers**: You can convert SomMark content into any format (HTML, Markdown, JSON, etc.) by using Mappers.
*   **Validation**: You can define rules to check your content, such as limiting the number of arguments or requiring specific keys.
*   **MDX Support**: SomMark can map to existing React components ("Only Ready Components").
> [!NOTE]
> SomMark does not parse raw JSX. It only maps to ready components.

# Syntax

SomMark uses three main types of elements: Blocks, Inline Statements, and At-Blocks.

## 1. Block

A Block is a container that holds content. It can contain text or other nested blocks.

**With Arguments**
You can pass data to a block using arguments. Arguments can have keys.
```ini
[Alert = urgent, title: Warning]
System maintenance in 10 minutes.
This block uses a flag (urgent) and a key-value pair (title).
[end]
```
> [!NOTE]
> The colon `:` separates keys and values.
> Keys are optional.

**Without Arguments**
```ini
[Note]
This is a simple block.
[end]
```

## 2. Inline Statement

Inline Statements are used to format specific parts of text.

**With Arguments**
```ini
This text is (bold)->(bold) and this is (red)->(color: red).
```
> [!NOTE]
> Inline arguments are values only. Keys are not supported.

**Without Arguments**
```ini
(Click here)->(Button)
```

## 3. At-Block

At-Blocks are used for specific content like code snippets or tables. The content inside an At-Block is treated as plain text and cannot contain other SomMark elements.

**With Arguments**
```ini
@_Code_@: javascript;
console.log("This is raw code.");
@_end_@
```
> [!NOTE]
> You must use a semi-colon `;` to end the argument list.

**Without Arguments**
```ini
@_Raw_@
Raw content here.
@_end_@
```

## General Rules
* SomMark Top-Level Rules:
  - Only Blocks and comments are allowed at the top level.
  - Inline Statements, Atblocks, and text cannot appear at the top level. They must be inside a Block, or it is invalid.
  **Invalid Top-Level:**
  ```ini
  Hello world             ❌  (Text cannot be at top level)
  
  Welcome to (SomMark)->(Bold)         ❌  (Inline statement cannot be at top level)
  
  @_Code_@: js;
  function add(a, b) {
    return a + b;
  }
  @_end_@                 ❌  (Atblock cannot be at top level)
  ```
  
  **Valid Top-Level:**
  ```ini
  [Block]
    Hello world 
    Welcome to (SomMark)->(Bold)          # Inline statement inside block is valid
  
    @_Code_@: js;
    function add(a, b) {
      return a + b;                        # Treated as plain text
    }       
    @_end_@
  
  [end]
  ```


*   **Identifiers**: Names can only contain letters and numbers.
*   **Escape Character**: Use the backslash `\` to escape special characters (like colons or commas) inside arguments.
*   **Colons**: inside Block and At-Block arguments, the colon (`:`) separates names from values.
*   **Semi-Colons**: The semi-colon (`;`) is only used in At-Blocks to assert the end of the argument list.
*   **Whitespace**: SomMark ignores extra spaces and newlines, so you can format your code however you like.

# Installation

To install the Command Line Interface (CLI) globally:

```bash
npm install -g sommark
```

# Usage

## Using the CLI

You can convert files using the terminal.

```bash
# Convert to HTML
sommark --html input.smark -o output

# Convert to Markdown
sommark --markdown input.smark -o output.md
```

## Using in Code

You can use SomMark in your JavaScript or Node.js projects.

```javascript
import SomMark from "sommark";

const source = `
[Block]
Hello World
[end]
`;

const smark = new SomMark({
    src: source,
    format: "html"
});

console.log(await smark.transpile());
```

# Documentation

Detailed guides and API references are available in the `docs/` directory:

*   **[Syntax Guide](docs/syntax.md)**: Master SomMark syntax (Blocks, Inline, At-Blocks).
*   **[Core API](docs/core.md)**: Programmatic usage of the library (`transpile`, `lex`, `parse`).
*   **[Mapper API](docs/mapper.md)**: Guide for creating custom mappers and rules.
*   **[CLI Reference](docs/cli.md)**: Command line options and configurations.
*   **[API Quick Reference](docs/api)**: Fast lookup for all classes and functions.
*   **[Configuration Reference](docs/config.md)**: Guide for creating custom configurations.



# Configuration (Only for CLI)

You can create a `smark.config.js` file to configure the CLI.

```javascript
/* smark.config.js */
import myMapper from "./my-mapper.js";

export default {
    outputFile: "output",    // Default output filename
    outputDir: "./dist",     // Where to save files
    mappingFile: myMapper    // Use a custom mapper by default
};
```

# Creating Custom Mappers

Mappers tell SomMark how to convert your content. You can define rules, options, and how arguments are handled.

## Basic Structure

```javascript
import { Mapper } from "sommark";
const myMapper = new Mapper();
const { tag } = myMapper;

// Define a Block
myMapper.register("Alert", ({ args, content }) => {
    // Access arguments by index or name
    const type = args[0] || args.type || "info"; 
    
    // Use TagBuilder to create HTML elements safely
    return myMapper.tag("div")
        .attributes({ class: `alert ${type}` })
        .body(content);
});

export default myMapper;
```
> [!WARNING]
> The `.body()` and `.selfClose()` methods return the final HTML string. You must treat them as the end of the builder chain. If you forget to call them, you will return a builder object instead of a string.

You also skip tag builder and use raw HTML.

```javascript
import { Mapper } from "sommark";
const myMapper = new Mapper();

myMapper.register("Alert", ({ args, content }) => {
    // Access arguments by index or name
    const type = args[0] || args.type || "info"; 
    
    // Use raw HTML
    return `<div class="alert ${type}">${content}</div>`;
});
```

## Mapping Multiple Identifiers

You can use an array of strings to map multiple names to the same output function.

```javascript
import { Mapper } from "sommark";
const myMapper = new Mapper();
const { tag } = myMapper;

// Both [code] and [Code] will use this mapper
myMapper.register(["code", "Code"], ({ content }) => {
    return tag("pre").body(tag("code").body(content));
});
```

## Reusing Existing Mappers

You can borrow rules from default mappers to avoid rewriting them.

```javascript
import { Mapper, HTML } from "sommark";
const myMapper = new Mapper();

// Reuse the "Code" block from the default HTML mapper
const codeOutput = HTML.get("Code");
if (codeOutput) {
    myMapper.register(codeOutput.id, codeOutput.render, codeOutput.options);
}

// Add your own custom blocks...
myMapper.register("MyBlock", ({ content }) => {
    return content;
});

export default myMapper;
```

## Using Rules (Validation)

You can force strict rules on your content. If a rule is broken, SomMark will stop and show an error.

### Argument Validation (`args`)

Validates the arguments passed to the tag.

```javascript
myMapper.register("User", ({ args }) => {
    return tag("div").body(`User: ${args[0]}`);
}, {
    rules: {
        args: {
            min: 1,           // Must have at least 1 argument
            max: 3,           // Cannot have more than 3 arguments
            required: ["id"], // The "id" named key is required
            includes: ["id", "role", "age"] // Only these keys are allowed
        }
    }
});
```

- **`min`**: Minimum number of arguments required.
- **`max`**: Maximum number of arguments allowed.
- **`required`**: Array of keys that MUST be present in the arguments.
- **`includes`**: Whitelist of allowed argument keys. Any key not in this list will trigger an error.

### Content Validation (`content`)

Validates the inner content (body) of the block.

```javascript
myMapper.register("Summary", ({ content }) => {
    return tag("p").body(content);
}, {
    rules: {
        content: {
            maxLength: 100 // Content must be 100 characters or less
        }
    }
});
```

- **`maxLength`**: Maximum length of the content string.

### Self-Closing Tags

Ensures a tag is used without content or children.

```javascript
myMapper.register("Separator", () => {
    return tag("hr").selfClose();
}, {
    rules: {
        is_Self_closing: true
    }
});
```

- **`is_Self_closing`**: If `true`, SomMark will throw an error if the tag contains any content.

*Example input that passes:* `[Image = src: image.png, alt: Image][end]`

## Using Options

Options change how SomMark processes the content inside the block.

```javascript
import { Mapper } from "sommark";
const myMapper = new Mapper();
const { tag } = myMapper;

myMapper.register("Code", ({ content }) => {
    return tag("pre").body(content);
}, {
    escape: false,
    rules: {
        args: {
            min: 1,           
            required: ["id"]
        }
    }
    }); // options
```
--- 

# License

MIT