# Changelog

## v2.0.1 (2026-02-02)

### Refactoring
- **Highlight System**: Removed dependency on filesystem loading for themes. Bundled `atom-one-dark` theme by default.
- **Theme Registry**: Introduced `registerHighlightTheme` and `selectHighlightTheme` for easier theme management.
- **Auto-Detection**: Removed `hasCode` property. The transpiler now auto-detects code blocks for style injection if `enable_highlightTheme` is true.

### Documentation
- **API Reference**: Complete overhaul of `docs/api` with renumbered files and new methods.
- **Syntax Guide**: Added comprehensive documentation for Block, Inline, and AtBlock syntax with examples.
- **Mappers**: Added `default_mappers.md` listing all built-in HTML, Markdown, and MDX mappings.
- **Escape Characters**: Added `escape_character.md` guide.

### Fixes
- **Browser Compatibility**: Fixed `loadCss` to work correctly in browser environments using `fetch`.
- **Path Resolution**: Fixed path resolution issues for theme loading.

## v2.0.0 (2026-02-01)

> [!WARNING]
> Old version is no longer supported.

### Breaking Changes

- **At-Blocks Terminator**: At-Blocks now require a semicolon (`;`) at the end of the argument list to support multi-line headers.

### Features
- **Flexible Inline Syntax**: Support for newlines and whitespace within inline syntax.
- **Flexible Block Definitions**: Support for multi-line headers in block definitions.
- **Named Arguments**: Blocks and At-Blocks now support Key-Value (named) arguments, allowing for order-independent and optional parameters.
- **Multi-Value Inlines**: Inline identifiers now support multiple comma-separated values (e.g., `(Text)->(gradient: red, blue)`).
- **Escape Character Support**: Added support for escaping special characters in arguments using a backslash (`\`).
- **Text Output Rendering**: Added functionality to render pure text output.
- **Mapper Validation**: Mappers can now define validation rules (self-rules) that are enforced by the transpiler.

### Improvements
- **Lexer Refactor**: The lexer now treats commas (`,`) as distinct tokens, also colons (`:`) are now treated as distinct tokens..
- **Mapper Logic**: General improvements to mapper internal logic.
- **API References**: Improved documentation and API references.
- **Testing**: Updated tests for new syntax and added coverage for new features.
