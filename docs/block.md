# Block Syntax

Blocks are the fundamental container structures in SomMark. They group content and define the scope for transformations applied to sections of a document.

Inline statements, at-blocks, and text must be defined inside a Block. Defining any of these at the top level will result in a parsing error.

At the top level, only Blocks and comments are permitted.

## Syntax

```ini
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
```ini
[Identifier=arg1, arg2]
```

### Key-Value Arguments
You can also use named arguments with `key:value` syntax.
```ini
[Identifier=key:value, width:100%][end]
```

