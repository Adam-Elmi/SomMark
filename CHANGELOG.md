# Changelog

## v5.1.0 (2026-07-02)

### Added

- **`join` prop in `[for-each]`** — inserts a separator string between each iteration's output. The separator is not appended after the last item, matching the behavior of `Array.prototype.join()`.
  ```ini
  [for-each = ${ ["Python", "Lua", "Javascript"] }$, join: ", "]
    ${ value }$
  [end:for-each]
  ```
  Output: `Python, Lua, Javascript`

- **`length` variable in `[for-each]`** — exposes the total number of items in the array as a reserved variable alongside `i`. Useful for conditional logic on the first or last item.
  ```ini
  [for-each = ${ [1, 2, 3] }$]
    ${ value }$${ i < length - 1 ? ", " : "" }$
  [end:for-each]
  ```
  `length` is now reserved — `as: "length"` throws an error.

- **Directive props (`smark-*`)** — any prop prefixed with `smark-` is stripped from the rendered output and exposed to custom mappers via `node.directives` with the prefix removed.

- **Bundler plugins now self-contained** — `sommarkRollup()` and `sommarkEsbuild()` handle QuickJS WASM asset copying and URL rewriting internally. Users no longer need a separate `wasmAssets()` call in their config. `sommarkVite()` added for Vite projects.

- **`[raw]` block** — available across all mappers (except `json`, `jsonc` and `text` mappers) as a universal passthrough container.

- **Missing array prop error in `[for-each]`** — omitting the required array prop now throws a clear compile-time error instead of silently producing no output.

### Fixed

- **`${ }$` blocks in imported modules used the wrong `baseDir`** — logic nodes resolved paths relative to the main file instead of their own module's directory. Each logic node is now stamped with its source module's directory before caching. Closes #11.

- **`v{}` not resolved when embedded inside a prop string** — envelopes inside compound values like `"btn btn--v{variant}"` were passed through unchanged. They are now replaced in-place; unresolved ones collapse to `""`. Closes #12.

- **`v{key | "fallback"}` fallback ignored at module parse time** — the parser baked the fallback into the AST before the caller could provide a value. Fallback is now encoded in the envelope and applied at instantiation. Closes #13.

- **Crash when `[import]` is used without a filesystem** — compiling in environments with no `fs` (browser, virtual) crashed when a template contained an `[import]` block. The module resolver now gracefully handles missing filesystem contexts. Closes #14.

- **Evaluator module filename conflict** — eval'd code blocks used a shared filename key that collided across concurrent compilations, causing stale cached modules to be returned for unrelated blocks. Each block now gets a unique key. Closes #15.

- **Config loader failed to find `smark.config.js`** — the config search walked the directory tree incorrectly under certain working directory setups, silently falling back to defaults. The traversal logic has been corrected. Closes #16.

- **Markdown mapper lowercased unknown tag names** — unrecognized tags passed through `getUnknownTag` had their name lowercased unconditionally, turning custom PascalCase component tags into invalid lowercase ones. Case is now preserved. Closes #17.

- **`sommark/browser` entry broken in bundlers** — the `browser` field in `package.json` mapped `node:async_hooks` to a shim that wasn't needed (the browser entry already imports `./async-hooks.js` directly), causing bundlers to incorrectly redirect internal imports. The field has been removed.

- **`SomMark.fetch()` response missing fields** — the response object now includes `type`, `redirected`, and `clone()` to match the standard Fetch API shape.

---

## v5.0.5 (2026-06-26)

## Fixed

- Prevent `smark-raw` directive from leaking onto root element

## v5.0.4 (2026-06-25)

### Fixed

- **`v{key | "fallback"}` fallback ignored at module parse time** — the parser baked the fallback into the AST before the caller could provide a value. Fallback is now encoded in the envelope and applied at instantiation. Closes #13.

- **`v{}` not resolved when embedded inside a prop string** — envelopes inside compound values like `"btn btn--v{variant}"` were passed through unchanged. They are now replaced in-place; unresolved ones collapse to `""`. Closes #12.

- **`${ }$` blocks in imported modules used the wrong `baseDir`** — logic nodes resolved paths relative to the main file instead of their own module. Each logic node is now stamped with its source module's directory before caching. Closes #11.

- **Concurrent `transpile()` calls crashed due to shared evaluator state** — the evaluator singleton's instance stack was shared across concurrent calls, causing corruption. Each call now gets its own isolated stack via `AsyncLocalStorage`. Closes #10.

- **`v{}` fallback ignored when transpiling a file directly** — fallbacks only applied inside module instantiation. `applyVariableFallbacks()` is now called in `transpile()` so standalone files also use fallbacks. Bare unresolved envelopes (no fallback) remain visible as a debugging signal.

- **Custom filesystems not propagated to nested module instances** — sub-`SomMark` instances created during module resolution fell back to the default Node.js `fs`, breaking `VirtualFS` and `FetchFS` for nested imports. Both creation sites now forward `fs: context.instance.fs`.

---

## v5.0.3 (2026-06-24)

### Fixed

- **`${ }$` no longer implicitly adds `static` keyword** — bare `${ }$` blocks are now treated as static directly, without the lexer appending a hidden `static` token.

---

## v5.0.2 (2026-06-24)

### Fixed

- **`smark-raw` block leaked into `dualOutput` JS output** — when `dualOutput: true` is set, the transpiler generates two passes: one for HTML, one for the JS runtime. The `smark-raw` handler was executing unconditionally — it ran the mapper render (which returns HTML) even during the JS-only pass. The HTML then ended up in the JS module, causing Vite's import-analysis parser to fail with an invalid JS syntax error. The fix returns an empty string for `smark-raw` blocks in runtime-output mode, since raw blocks contain no runtime logic by definition.

---

## v5.0.1 (2026-06-23)

### Changed

- **`fallbackTarget` simplified to boolean** — use `true` (inline style fallback, default) or `false` (render unrecognized props as plain HTML attributes). `"style"` is still accepted as an alias for `true` for backward compatibility. `"class"` has been removed — it was never implemented.

### Fixed

- **`color` removed from `HTML_PROPS`** — `color` is a deprecated HTML4 attribute (`<font color="">`, `<hr color="">`). In modern HTML it is always a CSS property, so having it in the attribute list caused `[h2 = color: "red"]` to produce `color="red"` instead of `style="color:red;"`.

- **`align`, `bgcolor`, `border` removed from `HTML_PROPS`** — all three are deprecated HTML4 attributes. In any modern context they are CSS properties (`text-align`, `background-color`, `border`), so keeping them in the list silently swallowed the user's CSS intent and rendered them as invalid HTML attributes.

- **`alpha` removed from `HTML_PROPS`** — `alpha` is not an HTML element attribute. It is a JavaScript canvas context option (`getContext('2d', { alpha: false })`). It should never have been in the list.

---

## v5.0.0 — Official Stable Release (2026-06-23)

This is the last major version of SomMark. The main goal has been reached: a single consistent block syntax that compiles to any output format. Future releases will be minor updates or patches.

### Added

- **YAML mapper** — typed scalars (`[str]`, `[int]`, `[float]`, `[number]`, `[bool]`, `[null]`), sequences (`[seq]`), mappings (`[mapping]`, `[map-item]`), multi-line scalars (`[literal]`, `[folded]`), document markers (`[doc-start]`, `[doc-end]`), and `getUnknownTag` shorthand (tag name becomes the YAML key, type inferred automatically).

- **TOML mapper** — same typed scalars as YAML with `[int]`/`[float]`/`[number]` build-time validation, tables (`[table]`, `[array-of-tables]`), arrays (`[array]`), multi-line strings (`[ml-string]`), and `getUnknownTag` shorthand.

- **CSV mapper** — `[row]`, `[cell]`, `[header]` blocks with configurable delimiter.

- **`smark-raw: true` prop** — add this to any block header and the lexer stops parsing the body, collecting everything until `[end]` as a single raw text node. The renderer receives the body exactly as written — brackets, comments, and SomMark syntax are all treated as plain text. Escape a literal `[` with `\[`.

- **`renderChild` custom props** — `renderChild(child, { ...props })` now forwards any extra properties to the child renderer as named parameters. The transpiler delivers them transparently — the child just declares the parameter by name. This is how structural parent blocks (like `[mapping]` or `[seq]`) pass context such as `depth`, `inSeq`, or `inMapItem` to their children without the engine needing to know the property names.

- **Mapper creation guides** — `docs/guides/html-mapper.md` (11 steps, when NOT to use `handleAst`) and `docs/guides/yaml-mapper.md` (11 steps, why `handleAst: true` is needed everywhere in YAML).

- **`docs/glossary.md`** — SomMark terminology reference.

- **Language docs** — `docs/languages/yaml.md`, `docs/languages/toml.md`, `docs/languages/csv.md`.

- **`docs/api/Mapper/renderChild.md`** — step-by-step guide with ASCII flow diagrams.

- **`docs/syntax/smark-raw.md`** — full reference for the raw body prop.

### Removed

- **`js{}` prefix layer** — superseded by `static ${ }$` expressions. Use `static ${ value }$` anywhere you previously used `js{}`.

- **`generateRuntimeOutput` and `hideRuntimeOutput` options** — runtime output handling has been simplified. Use `dualOutput: true` if you need both HTML and JS from one compilation.

- **`atBlockBody` mapper method** — at-block syntax (`@_..._@`) removed from the engine. Use `smark-raw: true` for raw body content.

- **`inlineText` mapper method** — inline element syntax `(text)->(tag)` removed from the engine.

- **`[raw]` shared output registration** — removed from `mappers/shared/index.js`. Blocks that need raw output should use `smark-raw: true` or register their own renderer. Each format's `getUnknownTag` now handles `[raw]` naturally.

- **Docs for removed APIs** — `generateRuntimeOutput.md`, `hideRuntimeOutput.md`, `atBlockBody.md`, `inlineText.md`, `atblock.md`, `inline.md`, `js.md`.

### Fixed

- **`showSpinner` defaults to `true`** — was missing from `defaultConfig`, which caused it to return `undefined`. Spinner is on unless you explicitly set `showSpinner: false`.

- **`sommark color on|off`** — was async with file I/O, causing the log message to not appear when called synchronously in tests. Now synchronous and prints `SOMMARK_COLOR=true` / `SOMMARK_COLOR=false` env var instructions directly to the terminal. Color preference is set via environment variable, not a config file.

---

## v4.5.3 (2026-06-14)

### Fixed

- **SVG attributes rendered as inline styles** — The HTML mapper uses a method called `smartAttributes` to process element props. For any prop that is not a known HTML attribute, `smartAttributes` falls back to putting it in a `style="..."` attribute. SVG attributes like `fill`, `d`, `clip-path`, and `viewBox` are not HTML attributes, so they were all ending up as `style="fill:red;d:...;"` instead of `fill="red" d="..."`. SVG elements now skip `smartAttributes` entirely and render their props as plain HTML attributes.

- **SVG camelCase tag names were lowercased in output** — The HTML mapper was lowercasing all unknown tag names before rendering. This turned `[clipPath]` into `<clippath>` and `[linearGradient]` into `<lineargradient>`. Inside `<svg>`, browsers are case-sensitive — `<clippath>` is not the same as `<clipPath>` and will be ignored, breaking things like clip masks. Tag names are now preserved exactly as written.

### Added

- **`constants/svg_elements.js`** — A new constant file listing all standard SVG elements. The HTML mapper checks this list to decide whether to skip `smartAttributes` for an element. To add support for a new SVG element, just add its name to this file — no logic changes needed.

- **33 missing HTML attributes in `html_props.js`** — `smartAttributes` uses a list called `HTML_PROPS` to decide which props are real HTML attributes. Any prop not in that list was falling back to `style`. Many common attributes were missing — `accept`, `hreflang`, `ping`, `colspan`, `rowspan`, `novalidate`, `open`, `datetime`, `fetchpriority`, `as`, `srcdoc`, `http-equiv`, and more. All are now in the list and will render as proper HTML attributes.

## v4.5.2 (2026-06-14)

### Fixed

- **Relative imports inside `static ${}$` blocks didn't work** — Writing `import { data } from "../constants/data.js"` inside a static block always failed with "Module not found", even when the file existed. The import path was being resolved from the project root instead of the current `.smark` file's directory. Now resolves correctly.

## v4.5.1 (2026-06-13)

### Fixed

- **Crash when a component imports other modules** — If a component used via `[Alias = ...]` had its own `[$use-module]` inside, SomMark threw a transpiler error. Now works correctly.

## v4.5.0 (2026-06-13)

Adds `dualOutput` for producing matching HTML and JS from one compilation, and warnings for conflicting output flags.

### New Features

- **`dualOutput: true`** — returns `[html, js]` from a single `transpile()` call.

  Each compilation generates random `data-sommark-id` values to link elements to their scripts. Two separate compilations produce different IDs, so the JS `querySelector` never finds the element:

  ```js
  // ✗ IDs will never match — two compilations, two different random IDs
  const html = await transpile({ src, format: "html", hideRuntimeOutput: true });
  const js   = await transpile({ src, format: "html", generateRuntimeOutput: true });
  ```

  `dualOutput` fixes this by running both passes inside one call and sharing the IDs:

  ```js
  // ✓ One compilation — IDs always match
  const [html, js] = await new SomMark({ src, format: "html", dualOutput: true }).transpile();
  ```

  See [`docs/api/Core/dualOutput.md`](docs/api/Core/dualOutput.md) for full details.

## v4.4.0 (2026-06-12)

Adds the `sommark bundle` CLI command and three new partial browser bundles.

### New Features - For cli
- **`sommark bundle [dir path]`** — copies the full browser bundle (`dist/` folder, JS + WASM) into your project directory. Run once, then serve via HTTP.
- **`sommark bundle [dir path] --lite`** — copies a single-file lite bundle with no WASM. Static and runtime blocks are disabled; everything else works.
- **`sommark bundle [dir path] --only-lexer`** — copies `sommark.lexer.js` (32 KB). Exports `lexSync`, `lex`, `TOKEN_TYPES`, and `labels`.
- **`sommark bundle [dir path] --only-parser`** — copies `sommark.parser.js` (83 KB). Exports everything in the lexer bundle plus `parseSync` and `parse`.

### Info:
- **`dist/sommark.browser.lite.js`** — lite bundle build output.
- **`dist/sommark.lexer.js`** — lexer-only bundle build output.
- **`dist/sommark.parser.js`** — parser bundle build output.

### Docs
- **`docs/SomMark-Browser.md`** — updated with local bundle setup, bundle comparison table, and use cases for each partial bundle.

## v4.3.0 (2026-06-09)

Adds a pre-built browser bundle for CDN and no-bundler use.

### Added

*   **`dist/sommark.browser.js`**: Pre-built ESM bundle with all dependencies included. Works directly in a `<script type="module">` tag — no bundler needed.
*   **`docs/SomMark-Browser.md`**: New guide covering CDN usage, bundler setup, module imports, and in-memory files.


### CDN URLs

```
https://cdn.jsdelivr.net/npm/sommark@4.3.0/dist/sommark.browser.js
https://unpkg.com/sommark@4.3.0/dist/sommark.browser.js
```

## v4.2.0 (2026-06-09)

Adds full browser support, fixes bugs, and expands tests and docs.

### Browser Support

*   **`FetchFS`**: Fetches `[import = ...]` module files using the browser `fetch` API. Each file is cached so it is only fetched once per compilation.
*   **`VirtualFS` async interface**: Added async `exists()` and `readFile()` methods so `VirtualFS` and `FetchFS` work the same way.
*   **`core/modules.js`**: All file reads are now async. URL paths are resolved with `new URL()` instead of `pathe.resolve` to avoid broken paths.
*   **`core/helpers/preprocessor.js`**: Reads module files through `instance.fs`. Falls back to `node:fs` when called without an instance (e.g. in tests).
*   **`index.js`**: Wraps Node `fs` with async `exists` and `readFile`, then registers it via `setDefaultFs`. Sets the working directory on load.
*   **`index.shared.js`**: Automatically creates a `FetchFS` instance when `baseDir` is an `http(s)://` URL. Removed the `process` environment check.
*   **`index.browser.js`**: New browser entry point. Exports two helpers:
    *   `resolveBaseDir(path)` — turns a relative path into a full URL using `document.baseURI`. Use this as the `baseDir` option.
    *   `renderCompiledHTML(container, html)` — writes compiled HTML into a container and runs any `<script>` tags (which `innerHTML` would block).
*   **`package.json`**: Added `"sommark/browser"` export. Removed the `memfs` dependency.

### Bug Fixes

*   **Static block URL imports**: `pathe.resolve` was corrupting `http://` URLs when resolving imports inside static blocks. Fixed to use `new URL()`.
*   **`prefetchImports`**: Module imports inside static blocks are now fetched before QuickJS runs so the sync `readFileSync` calls find them in the cache.
*   **`SomMark.compile()` options**: The internal compile adapter only passed `format` and `variables` to sub-compilations. It now passes all options. `security` is always inherited from the parent and cannot be overridden.
*   **Inline space loss**: `dedentBy` was removing spaces between words on single-line text nodes (e.g. `"2026 edition."` became `"2026edition."`). It now skips text nodes that have no newline.
*   **`knownProps` validation**: Removed the `knownProps` list and its validation check from `transpile()`. Unknown options are now ignored instead of throwing.
*   **QuickJS crashes**: Fixed crashes and unhandled promise rejections when `await` is missing in a static block. Fixed a GC abort by cleaning up pending promises before the context is destroyed.

### Tests

*   `tests/helpers/virtual-fs.test.js` — VirtualFS: constructor, sync and async read and exists.
*   `tests/helpers/fetch-fs.test.js` — FetchFS: constructor, path resolution, caching, sync fallbacks.
*   `tests/core/browser-dom.test.js` — `resolveBaseDir` and `renderCompiledHTML` in a jsdom environment.
*   `tests/core/browser.test.js` — VirtualFS imports, `instance.fs` reads, non-browser error for `resolveBaseDir`.

### API Docs

*   **New**: `Browser/resolveBaseDir.md`, `Browser/renderCompiledHTML.md`, `Core/baseDir.md`, `Core/files.md`.
*   **Updated**: `Core/filename.md`, `Core/transpile.md`, `Sandbox/compile.md`, `Sandbox/raw.md`, `Sandbox/static.md`.

### Bundler Compatibility (`browser-test/`)

A test project that verifies SomMark works with Vite, Webpack, Rollup, and esbuild across dev, build, and preview modes.

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
