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

### Escape Characters
If your argument value contains special characters (like `,`, `:`, `@_`, `_@`, `\` , or `;`), use the backslash `\` to escape them.

```sommark
@_Identifier_@:title:Hello\, World;
```

## Examples

### Code Blocks
The most common use case is for code blocks with syntax highlighting.

```sommark
@_code_@:javascript;
console.log("Hello World");
function greet() {
    return "Hi!";
}
@_end_@
```

### Images
Some implementations might use AtBlocks for complex media embedding.

```sommark
@_image_@:width=500px;
https://example.com/image.png
@_end_@
```

### Alerts or Callouts
Creating styled alerts.

```sommark
@_alert_@:warning;
This is a warning message!
Be careful.
@_end_@
```
