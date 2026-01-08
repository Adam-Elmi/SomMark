# Changelog

## 1.0.0 (2026-01-04)
- Initial release
- Supports HTML, MD, MDX output
- CLI ready
- Lightweight 61 KB package

## 1.1.0 (2026-01-08)

### Features

- **Highlight.js Integration**:
    - Added support for highlight.js themes.
    - Added `codeThemes` and `selectedTheme` to Mapper configuration.
    - Default theme for HTML output is now `atom-one-dark`.
    - Added `helpers/loadStyle.js` to dynamically load theme CSS (isomorphic: supports both Node.js via `fs` and browser via `fetch`).
    - Automatically injects selected theme CSS into HTML output when code blocks are present.

- **Mappers**:
    - Added `includesId(id)` helper method to `Mapper` class for checking output mapping existence.

### Bug Fixes

- **Core/Parser**: Fixed a critical issue where global state variables (`block_stack`, `line`, etc.) were not reset between parse calls, causing errors on subsequent runs.
- **Core/Transpiler**: Removed leftover debug `console.log` calls.
- **Mappers/Markdown**: Fixed `Heading` block ignoring inner content (text/comments) in MD/MDX output. Now appends nested content after the heading.
- **Security**: Refactored HTML escaping architecture.
    - **Transpiler**: `AtBlock` content is now **escaped by default** in the transpiler to prevent XSS.
    - **Mapper**: Added `options` to `Mapper.create` (e.g., `{ escape: false }`) to allow specific blocks (like `Code`, `List`, `Table`) to opt-out of automatic escaping when they handle raw content safely or require it for parsing.
    - **Parser**: Removed manual escaping from Parser to support the new transpiler-based architecture.
