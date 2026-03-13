# Changelog

## v3.0.0 (2026-03-13)

> [!WARNING]
> Older versions (v1 and v2) are no longer supported.

### Breaking Changes

- Removed GFM format; use plugins instead.
- Stricter identifier rules: `$`, `_`, and `-` enforced consistently in lexer and parser.
- `end` is now a reserved keyword.
- Mapper `type` property deprecated in favour of explicit registration types.

### Features

- Full HTML5 support with built-in `html_tags`, `html_props`, and `void_elements` constants.
- Full Markdown and MDX support with rewritten class-based mappers.
- Scoped plugin system with instance isolation and priority-based `PluginManager`.
- Multi-stage plugin pipeline: `beforeLex`, `onAst`, `afterTranspile`.
- Built-in plugins: `CommentRemover`, `SelfClosing`, `QuoteEscaper`, `ModuleSystem`, `RawContent`, `RulesValidation`, `Highlighting`.
- `register()` and `inherit()` methods on the `SomMark` instance.
- Safe custom overrides for component mappers.
- CSS variable support (e.g. `color: --primary`).
- Auto-generated anchor IDs for headings.
- Case-insensitive target matching and `BODY_PLACEHOLDER` in transpiler.
- Mapper base class gains `clone()`, `clear()`, `extraProps()`.
- Broader JSON mapper output.
- Smart MDX mapper with JSX and style conversion.
- `lex` and `parse` CLI options added.
- Local `smark.config.js` takes priority over global config; CLI passes plugins and priority from config.

### Fixed

- Lexer infinite loops and crashes.
- Block spacing and paragraph newline handling.
- Newline tokenization for multi-line blocks.
- Multi-line prefixing in Markdown output.
- Comma handling in inline components.
- Void element nesting.
- Lexer `=` bug for literal equal signs.
- `--text` format error in CLI.

## v2.3.2

### Fixed
- Fixed: [Cli] CLI Fails to Print JSON Output with --json Flag (Issue #8)
- Fixed: [Parser] Inline Value Tokenization Fails When Starting or Containing Escape Character (Issue #9)

## v2.3.1 (2026-03-02)

### Fixed
* Fixed MDX format issue


## v2.3.0 (2026-02-23)

### Added

* Added missing JSON support in the CLI.
* Added two new methods: makeFrontmatter and raw_js_imports.
* Added new documentation.

### Fixed

* Fixed MDX format output error caused by extra whitespaces.
* Fixed colon issue in atblock body.

### Improved

* Improved several internal methods.
* Updated and enhanced tests.


## v2.2.0 (2026-02-23)
## Features
- Added JSON support
- Added type rules to validate element type
- Improved documentation
- Improved mapper files
- Removed **highlight.js** dependency
- Added new CLI feature: automatic configuration file creation


## v2.1.2 (2026-02-09)
### Fixes
-  Fixed cli print functionality

## v2.1.1 (2026-02-09)
### Fixes
-  Fixed undefined or null arguments

## v2.1.0 (2026-02-08)

### Fixes
-  Fixed styles property to include css styles

### Removed
- Removed `getStyle` method

### Features
- Added new rule that handles self-closing tags

### Improvements
- Improved documentation
- Added missing property `enable_table_styles` from `/mappers/mapper.js`


## v2.0.2 (2026-02-03)

### Features
- **Exports**: Exposed `TOKEN_TYPES` and `labels` from core for advanced usage.

### Refactoring
- **Config**: Removed unused `custom_html` import from `smark.config.js`.

### Fixes
- **CLI**: Fixed typo in help message.
- **Cleanup**: Cleaned up `.npmignore`.

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
