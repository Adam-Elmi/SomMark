# Block Syntax

Blocks are the fundamental container structures in SomMark. They are used to group content and apply specific transformations to a section of your document.

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
