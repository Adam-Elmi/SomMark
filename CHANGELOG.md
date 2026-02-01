# Changelog

## v2.0.0 (2026-02-01)

SomMark v2 is a complete architectural overhaul of the language, introducing a programmatic developer API, a robust token-based lexer, and a powerful validation system. This release focuses on stability, flexibility, and a streamlined developer experience.

### Breaking Changes
- **API Rename**: `Mapper.create` has been renamed to **`Mapper.register`**.
- **Escape Syntax**: Replaced the backtick escape syntax with a standard **backslash** (`\`) escape character.
- **At-Block Terminator**: At-Blocks headers now require a **semicolon** (`;`) to terminate the argument list, allowing headers to span multiple lines.
- **Style Architecture**: `loadStyleTag` has been replaced by **`loadStyles`**. It now returns raw CSS strings instead of wrapped tags to allow for centralized style management.
- **Parser State**: The parser now resets its internal global state between calls, ensuring reliability in high-frequency environments.

### Core Architecture & Lexer
- **Token-based Lexer**: Moved from regex-based parsing to a robust token-based system with specialized concatenation handlers (`concatText`, `concatEscape`, `concatChar`).
- **TagBuilder Refactor**: Improved `props()` to support method chaining and flexible input (object/array). Fixed `todo` mapper in HTML to correctly set the `checked` attribute.
- **Lexer Upgrades**: Comma (`,`), Colon (`:`), and Semicolon (`;`) are now distinct tokens. Improved newline and whitespace metadata accuracy.
- **Metadata Precision**: Improved line and column tracking for all token types, including those spanning multiple lines.

### Syntax Features
- **Named Arguments**: Blocks and At-Blocks now support **Key-Value pairs** (e.g., `[Block = Adam, id:101]`), allowing for order-independent and optional parameters.
- **Multi-line Headers**: Both Blocks and At-Blocks now support headers that span multiple lines for better readability.
- **Flexible Indentation**: Block definitions are no longer sensitive to leading whitespace, allowing for more natural document formatting.
- **Multi-Value Inlines**: Inline identifiers now support multiple comma-separated values (e.g., `(text)->(gradient: red, blue)`).

### Mapper & Style Management
- **Validation Rules**: Mappers can now define strict schemas (min/max args, required keys, max content length) that are enforced during transpilation.
- **Centralized Style System**: All styles (Highlight.js, Tables, and Custom) are now aggregated and injected into a single block in the final HTML output.
- **Object-based Styling**: `Mapper.addStyle()` now supports JavaScript objects for programmatic style definitions.
- **Isomorphic CSS Loader**: Added `Mapper.loadCss(path)` for safely loading external CSS in both Node.js and Browser environments.

### Output Formats
- **Text Format**: Added a new `text` output format for rendering pure, unformatted text.
- **Safe-by-Default Escaping**: HTML escaping has been moved to the transpiler layer, providing a secure default while allowing specific mappers to opt-out via configuration.

### Documentation
- **API Reference**: Created 5 comprehensive guides in the `/docs` directory covering Syntax, Core usage, CLI, and custom Mapper development.
- **Usage Examples**: Added a set of real-world examples (article, documentation, resume) demonstrating full v2 capabilities.

### CLI Improvements
- **Configuration Handling**: The CLI now correctly processes both instantiated Mapper objects and file paths in `smark.config.js`.
