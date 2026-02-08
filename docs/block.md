# Block Syntax

Blocks are the fundamental container structures in SomMark. They group content and define the scope for transformations applied to sections of a document.

Inline statements, at-blocks, and text must be defined inside a Block. Defining any of these at the top level will result in a parsing error.

At the top level, only Blocks and comments are permitted.

## Syntax

```sommark
[Identifier]
Valid SomMark content...
[end]
```

- **Identifier**: The name of the block (e.g., `Block`, `Section`, `Div`).
- **Content**: Can contain text, other blocks, inline elements, or AtBlocks.
- **End**: The block must be closed with `[end]`.

## Arguments

Blocks can accept arguments to customize their behavior. Arguments are separated by commas.

### Positional Arguments
```sommark
[Identifier=arg1, arg2]
```

### Key-Value Arguments
You can also use named arguments with `key:value` syntax.

[Identifier=key:value, width:100%]
```

### Escape Characters
If your argument value contains special characters (like `,`, `]`, `:`, `[`, `]`, `\`, or `=`), use the backslash `\` to escape them.

```sommark
[Div=title:Hello\, World, data:value\=10]

## Examples

### Basic Block
A simple block grouping content.

```sommark
[Block]
This is some content inside a block.
It can span multiple lines.
[end]
```

### Nested Blocks
Blocks can be nested inside one another.

```sommark
[Section]
    (Title)->(h1)

    [Div]
        This is a nested div.
    [end]
[end]
```

### Block with Arguments
Passing arguments to a block (e.g., CSS classes, attributes, or configuration).

```sommark
// Positional
[Div=className, idName]

// Key-Value
[Section=bg:blue, color:white]
```
