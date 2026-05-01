# Changelog

## v4.0.3 (2026-05-02)

*   **Improved**: Implemented **Strict Configuration Priority** (Target Directory > Current Working Directory). The CLI now correctly prioritizes `smark.config.js` found next to the source file.
*   **Improved**: Updated **Validator** to be whitespace-aware. Self-closing tags can now contain empty lines or spaces without triggering validation errors.
*   **Improved**: Enhanced `sommark show config [file]` to support targeted configuration inspection for specific source files.



## v4.0.2 (2026-04-29)

*   **Fixed**: CLI now correctly loads `smark.config.js` from the current working directory (CWD) even when processing files in subdirectories.
*   **Fixed**: Relative paths for `mapperFile` in the configuration are now correctly resolved relative to the config file's directory.

## v4.0.1 (2026-04-28)

*   **Fixed**: CLI now correctly loads mapper files (fixed `mappingFile` vs `mapperFile` naming bug).
*   **Fixed**: Transpiled output no longer contains extra spaces while keeping code correctly indented (column-based dedenting).
*   **Fixed**: Standardized property names (`placeholders`) and added missing tests for the CLI and config.

## v4.0.0: Redesigned and rewritten the SomMark engine (2026-04-24)

### Major Changes & New Features

#### 1. Prefix Layers
I introduced two new layers for dynamic data injection:
*   **Placeholder Layer (`p{}`)**: For simple text replacement in body text or arguments.
*   **JavaScript Data Layer (`js{}`)**: For passing native JavaScript types (Arrays, Objects, Booleans, Strings, Numbers, Null, Undefined, etc.) into component headers.

#### 2. Native Module System
I replaced the old, unstable logic with a robust, recursive module system.
*   **`[import]`**: Allows you to bring in external mappers.
*   **`[$use-module]`**: Allows you to inject those mappers into specific document scopes.

#### 3. Format-Free Transpiler
I have cleaned up how the Transpiler and Mapper communicate. Previously, the transpiler was filled with format-specific checks like `if(format === htmlFormat)`. I have removed these, making the transpiler completely format-agnostic and much easier to maintain.

#### 4. New Lexer & Semantic Tokens
I updated the Lexer to be more precise and introduced new tokens to handle the V4 structural rules:
*   `whitespace`, `import`, `$use-module`, `quote`, `prefix_js`, `prefix_p`, and `eof`.

#### 5. Complex Arguments with Double Quotes
I introduced support for double quotes in argument headers. This allows you to use complex keys and values (including those with colons or spaces) safely.

#### 6. Total Cleanup
I have entirely removed unnecessary methods and properties, streamlining the engine for high performance. SomMark is now clean, predictable, and works exactly as intended.
