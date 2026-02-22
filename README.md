<img width="2000" height="491" alt="SomMark Cover" src="https://raw.githubusercontent.com/Adam-Elmi/SomMark/master/assets/smark_bg.png" />

<p align="center">
SomMark is a declarative, extensible markup language for structured content that can be converted to HTML, Markdown, MDX, JSON, and more. 
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
<img src="https://img.shields.io/badge/type-markup%20language-white?style=flat-square" />

<!--SomMark Playground-->
<a href="https://adam-elmi.github.io/SomMark-Playground" target="_blank">
<img 
src="https://img.shields.io/badge/SomMark-Playground-blue?style=flat-square" 
alt="SomMark Playground Badge" />
</a>
</p>


----

## Try SomMark Playground

Test SomMark features live here:
[https://adam-elmi.github.io/SomMark-Playground/](https://adam-elmi.github.io/SomMark-Playground/)

----

# SomMark v2

> [!WARNING]
> Old version(v1) is no longer supported.

**SomMark** lets you write structured content that can be converted to HTML, Markdown, JSON, or other formats. Unlike standard Markdown, it uses explicit syntax for blocks and elements, making content easier to process, customize, and transform.

# Installation

To install the Command Line Interface (CLI) globally:

```bash
npm install -g sommark
```

# Usage

## Using the CLI

You can convert files using the terminal.

```bash
# Convert to HTML
sommark --html input.smark -o output

# Convert to Markdown
sommark --markdown input.smark -o output.md
```

## Using in Code

You can use SomMark in your JavaScript or Node.js projects.

```javascript
import SomMark from "sommark";

const source = `
[Block]
Hello World
[end]
`;

const smark = new SomMark({
	src: source,
	format: "html"
});

console.log(await smark.transpile());
```

# Documentation

Detailed guides and API references are available in the `docs/` directory:

- **[Syntax Guide](docs/syntax.md)**: Master SomMark syntax (Blocks, Inline, At-Blocks).
- **[Core API](docs/core.md)**: Programmatic usage of the library (`transpile`, `lex`, `parse`).
- **[Mapper API](docs/mapper.md)**: Guide for creating custom mappers and rules.
- **[CLI Reference](docs/cli.md)**: Command line options and configurations.
- **[API Quick Reference](docs/api)**: Fast lookup for all classes and functions.
- **[Configuration Reference](docs/config.md)**: Guide for creating custom configurations.
