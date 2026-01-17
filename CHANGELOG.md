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

## 1.1.1 (2026-01-10)

### Bug Fixes

- **CLI**: Fixed a bug where passing a Mapper object in `smark.config.js` (Custom Mode) caused a crash. The CLI now correctly handles both file path strings and imported Mapper objects.


## 1.2.0 (2026-01-14)

### Bug Fixes

* Fixed an issue where consecutive standalone blocks were not fully rendered when not separated by a blank line.

```ini
[Block]
This is a test.
[end]
[Block]
This is another test.
[end]
```

* Added support for inline block content while keeping the original multiline syntax fully compatible.

```yaml
[Block]Hello World[end]
```

---

### Code Improvements

* Removed unnecessary code
* Improved internal implementation

---

## v2.0.0-beta.1 (2026-01-17)

### Breaking Changes

* Replaced backtick-based escape syntax (`escape content`) with a single-character escape using backslash (`\`).
* Escape handling is now active inside **at-blocks**, inline values, and block bodies.
* Documents using the previous escape syntax must be updated.

---

### Parser & Lexer Improvements

* Refactored character concatenation logic by replacing the single `concat` function with specialized handlers:

  * `concatText`
  * `concatEscape`
  * `concatChar`

  This separation eliminated multiple hidden parsing bugs and significantly improved maintainability.

* Fixed an issue where **at-block endings were incorrectly treated as text** when preceded by leading spaces, which could corrupt the entire document.

* Fixed errors caused by starting a new block on the same line where a previous block ended (e.g. `[end][Block]`).

* Improved correctness when handling consecutive blocks without implicit line separation.

---

### Internal Improvements

* Simplified escape handling for safer and more predictable parsing
* Improved compatibility between escapes, inline values, and at-block bodies
* Reduced parser complexity and improved stability

---

### Notes

This release introduces **intentional breaking changes** to core grammar behavior.
It is published as a **beta** to allow validation before the stable **v2.0.0** release.

---
