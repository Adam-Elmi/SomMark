<img width="2000" height="491" alt="SomMark Cover" src="https://raw.githubusercontent.com/Adam-Elmi/SomMark/master/assets/smark_bg.png" />

<p align="center">
SomMark v3 is a simple, flexible markup language for structured content.
</p>

<p align="center">
<!--License-->
<a href="https://www.npmjs.com/package/sommark" target="_blank">
<img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />
</a>

<!--Npm Version-->
<a href="https://www.npmjs.com/package/sommark" target="_blank">
<img src="https://img.shields.io/npm/v/sommark?style=flat-square" />
</a>

<!--Language Type-->
<img src="https://img.shields.io/badge/type-markup%20language-orange?style=flat-square" />

<!--SomMark Playground-->
<a href="https://adam-elmi.github.io/SomMark-Playground" target="_blank">
<img 
src="https://img.shields.io/badge/SomMark-Playground-blue?style=flat-square" 
alt="SomMark Playground Badge" />
</a>
</p>

----

## Try SomMark Playground

Test SomMark live in your browser:  
[https://adam-elmi.github.io/SomMark-Playground/](https://adam-elmi.github.io/SomMark-Playground/)

----

# What's new in v3?

SomMark v3 is faster, more powerful, and easier to extend.

- **HTML Support**: Full HTML5 Support
- **Markdown Support**: Full Markdown Support
- **JSON Support**: Full JSON Support
- **MDX Support**: Full MDX Support
- **Plugin System**: Add new features without changing the core code.
- **Modular Support**: Easily import files and use variables.
- **Type-Safe Rules**: Set requirements for tags and attributes.
- **Clean Syntax**: Simplified block, atblock & inline rules and better error handling.

# Installation

```bash
npm install -g sommark
```

# Usage

## v3 Syntax Example

SomMark is designed to be readable and clear.

```ini
# Html
[h1]Welcome to SomMark v3[end]

[section = class: "hero", id: "main"]
  [a = href: "https://sommark.org"]Visit Website[end]
[end]

# Markdown
[quote]
SomMark is simple and powerful.
[end]

[bold]Check out our syntax guide![end]

# Json
[Json= object]
[Object = "user"]
  (name)->(string: "Adam Elmi")
  (age)->(number: 25)
  (is_active_user)->(bool: true)
[end]
[end]
```

## Using in JavaScript

```javascript
import SomMark from "sommark";

const smark = new SomMark({
	src: '[h1]Hello World[end]',
	format: "html"
});

console.log(await smark.transpile());
```

# Documentation

Read our detailed guides in the `docs/` folder:

- **[Syntax Guide](docs/03.syntax.md)**: How to write SomMark (Blocks, Inline, At-Blocks).
- **[Plugin System](docs/19.plugin-system.md)**: How to create your own plugins.
- **[Built-in Plugins](docs/20.built-in-plugins.md)**: Guide to standard plugins.
- **[Core API](docs/09.core.md)**: How to use SomMark in your code.
- **[Mapper API](docs/13.mapper.md)**: How to create new output formats.
- **[CLI Reference](docs/11.cli.md)**: Terminal commands and flags.
- **[API Quick Reference](docs/api)**: Fast lookup for all functions.
