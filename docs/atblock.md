# AtBlock Syntax

AtBlocks are special block-level constructs, often used for content that requires custom parsing or raw text handling, such as code blocks, images, or specialized directives.

## Syntax

```sommark
@_Identifier_@
Content...
@_end_@
```

- **Identifier**: The name of the AtBlock (e.g., `code`, `image`, `alert`).
- **Content**: The body of the block. For some AtBlocks (like code), this content is treated as raw text.
- **End**: Must be closed with `@_end_@`.

## Arguments

Arguments are passed immediately after the opening identifier.

### Positional
```sommark
@_Identifier_@:arg1;
```

### Key-Value
```sommark
@_Identifier_@:key:value, width:500px;
```
