# Changelog

## v4.1.0 (2026-06-01)

This release introduces native components, compile-time/runtime sandboxed JavaScript, loop control flow, simplified inline tags syntax, support for JSONC, and an array of new configuration options.

### 1. New Syntax & Elements

*   **Self-closing Blocks**: Define empty blocks (like line breaks or images) cleanly using a trailing exclamation mark `!`, eliminating the need for `[end]`.
    *   *Example*: `[br!]` or `[img = src: "logo.png" !]`
    *   *Docs*: [Self-closing Blocks](docs/syntax/self-closing.md)
*   **New Inline Element Syntax**: Enhanced inline tag assignments using `= props` instead of `: props`. This makes it clear and easy to differentiate tag names from props.
    *   *Example*: `(Click here)->(a = href: "https://sommark.org", id: "link")`
    *   *Docs*: [Inline Elements](docs/syntax/inline.md)
*   **Static Logic (Compile-Time JS)**: Execute sandboxed JavaScript inside `static ${ ... }$` blocks at compile-time to compute dynamic properties or fetch endpoints.
    *   *Example*: `Total: static ${ 10 + 20 }$` or `time: static ${ new Date().toISOString() }$`
    *   *Docs*: [Static Logic](docs/syntax/js.md)
*   **Runtime Logic (Client-Side JS)**: Embed client-side scripts inside `runtime ${ ... }$` blocks which are compiled directly into output wrappers (like HTML `<script>`).
    *   *Example*: `runtime ${ console.log("Hello from browser"); }$`
    *   *Docs*: [Runtime Logic](docs/syntax/js.md)
*   **For-Each Loop**: Loop through collections dynamically to generate structural layouts.
    *   *Example*: `[for-each = static ${ items }$, as: "item"] [p] v{item} [end] [end]`
    *   *Docs*: [For-each Loop](docs/syntax/for-each.md)
*   **Native Components**: Import Smark templates as reusable components using named tags while maintaining full support for `$use-module`.
    *   *Example*: `[import = Card: "./Card.smark"][end] [Card = title: "Hello" !]`
    *   *Docs*: [Native Components](docs/syntax/native-components.md)
*   **JSONC Format Support**: Compiles Smark configurations into JSON with Comments (JSONC) format.
    *   *Docs*: [JSON and JSONC](docs/languages/json.md)
*   **Local Variables (`v{}`)**: Local property-binding hooks within loops or component scopes that keep components completely isolated.
    *   *Example*: `[h1] v{title} [end]`
    *   *Docs*: [Local Variables](docs/syntax/variables.md)
*   **Comment Blocks**: Write clean multi-line comments anywhere in your source; stripped automatically at build-time.
    *   *Example*: `### This is a \n multi-line comment ###`
    *   *Docs*: [Comments](docs/syntax/comment.md)

### 2. New Configuration Settings

Customize and fine-tune Smark's execution pipeline using the new configuration properties:

*   **`fallbackTarget`**: Customizes the automatic styling property fallback strategy (`style`, `class`, or `false`).
    *   *Docs*: [Fallback Target API](docs/api/Core/fallbackTarget.md)
*   **`outputValidator`**: Executes a custom validation function on the generated string before resolving transpilation.
    *   *Docs*: [Output Validator API](docs/api/Core/outputValidator.md)
*   **`importAliases`**: Configures virtual import paths and root path mappings.
    *   *Docs*: [Import Aliases API](docs/api/Core/importAliases.md)
*   **`security`**: Restricts raw HTML (`allowRaw`), script execution times (`timeout`), network accesses (`allowFetch`/`allowedOrigins`/`allowHttp`), whitelisted import paths (`allowedExtensions`), and compilation nesting scopes (`maxDepth`).
    *   *Docs*: [Security Options API](docs/api/Core/security.md)
*   **`generateRuntimeOutput`**: Generates and compiles client-side assets and logic.
    *   *Docs*: [Generate Runtime API](docs/api/Core/generateRuntimeOutput.md)
*   **`hideRuntimeOutput`**: Completely hides client-side logic blocks from the final output for SSR optimization.
    *   *Docs*: [Hide Runtime API](docs/api/Core/hideRuntimeOutput.md)
*   **`showSpinner`**: Toggles Smark's interactive CLI build spinner feedback.
    *   *Docs*: [Show Spinner API](docs/api/Core/showSpinner.md)

### 3. Core Engine Extensions

*   **Sandbox APIs**: Exposes premium VM sandboxing capabilities (`Evaluator`), including recursive module caching, fetch isolation, and sandbox hooks.
    *   *Docs*: [Sandbox Architecture](docs/core/evaluator.md)

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
