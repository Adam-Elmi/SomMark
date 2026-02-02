# Inline Syntax

Inline elements are used for shorter, phrase content within your document, such as headers, links, bold text, or custom spans.

## Syntax

```sommark
(Content)->(Identifier)
```

- **Content**: The text or value to be transformed.
- **Identifier**: The target element or function to apply (e.g., `h1`, `bold`, `link`).

## Arguments

Arguments are passed within the second parenthesis, separated by commas or colons depending on the identifier's requirements.

```sommark
(Content)->(Identifier: Arg1, Arg2)
```

### Escape Characters
If your argument value or content contains special characters (like `)`, `->`, or `,`), use the backslash `\` to escape them.

```sommark
(Content with \))->(Identifier: Arg with \, comma)
```

## Examples

### Headers
Creating headers levels 1-6.

```sommark
(Main Title)->(h1)
(Subtitle)->(h2)
```

### Text Formatting
Applying format styles like bold or italic.

```sommark
(This text is bold)->(bold)
(This text is italic)->(italic)
```

### Links
Links typically take the URL as an argument.

```sommark
(Visit Google)->(link: https://google.com)
```

### Custom Identifiers
You can define custom inline mappers that accept multiple arguments.

```sommark
(Some Content)->(customSpan: red, 20px)
```
