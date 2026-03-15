# Deprecated APIs

This document catalogs APIs that have been removed from the core `Mapper` class or relocated to improve system modularity.

## Syntax Highlighting & Themes (Removed from Core)

These properties and methods were removed from the core `Mapper` class. Syntax highlighting is now handled via plugins.

- **`highlightCode`**: Previously used to toggle automatic syntax highlighting. Now managed by overriding the `Code` block registration.
- **`themes`**: Registry of highlighting themes. Now handled by individual plugins.
- **`currentTheme`**: The name of the currently active theme.
- **`enable_highlightTheme`**: Controlled automatic injection of theme CSS.
- **`env`**: Set runtime environment (`node` vs `browser`) for resource loading.
- **`registerHighlightTheme(name, css)`**: Registered a new theme.
- **`selectHighlightTheme(name)`**: Selected an active theme.

## Formatting Utilities (Relocated)

These methods were removed as direct `Mapper` methods and moved to standalone utilities in `helpers/utils.js`. They are now exposed via the main library entry points.

- **`htmlTable(data, headers)`**: Generates an HTML table. (Use `import { htmlTable } from "sommark"`)
- **`list(data, as)`**: Generates an HTML list (`<ul>`/`<ol>`). (Use `import { list } from "sommark"`)
- **`parseList(data, indentSize)`**: Parses hierarchical list data. (Use `import { parseList } from "sommark"`)
- **`todo(checked)`**: Parses todo item state. (Use `import { todo } from "sommark"`)
- **`code(args, content)`**: Formatted code blocks. (Now specialized within `HtmlMapper` or plugins).

## Other Properties & Helpers (Removed)

- **`loadCss(env, filePath)`**: Previously used to load external CSS files. (Removed as it relied on legacy `env` property).
- **`enable_table_styles`**: Boolean flag for automatic table CSS injection.
