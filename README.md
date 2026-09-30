<p align="center">
  <img src="assets/arcmoon-logo.svg" alt="ArcMoon logo" width="120">
</p>

<h1 align="center">ArcMoon</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/arcmoon"><img src="https://img.shields.io/npm/v/arcmoon/beta?color=d9263f&label=npm" alt="npm version"></a>
  <img src="https://img.shields.io/badge/license-MIT-3b82f6" alt="MIT license">
  <img src="https://img.shields.io/badge/node-%3E%3D20.10-339933?logo=node.js&logoColor=white" alt="Node.js 20.10 or newer">
</p>

<p align="center">ArcMoon is a template language. You write <code>.arcm</code> files, and ArcMoon builds them into web pages.</p>

> **Beta.** ArcMoon works, but things may change before 1.0.

## What is ArcMoon?

A `.arcm` file holds a page's markup, styles and code. ArcMoon builds it into a web page.

- **Markup:** blocks like `[p]Hello[end]` become HTML elements. Pages are built from components and layouts.
- **Code at build time:** code in `${ }$` runs in Node.js while the page is built. It can read files, use npm packages and fill the page with data.
- **Code in the browser:** code in `runtime ${ }$` runs in the browser. Live values update the page when their data changes.
- **Styles:** a component's `[style]` only styles that component.
- **Output:** plain HTML, with only the CSS and JavaScript each page needs.

```ini
[import = Layout: "./Layout.arcm" !]

${ const name = "World"; }$

[Layout = title: "Home"]
  [h1]Hello, ${ name }$![end]
[end]
```

## Installation

Install the `arcm` command:

```bash
npm install -g arcmoon
```

Check that it works:

```bash
arcm -v
```

`arcmoon` and its short name `arcm` are the same command.

To use ArcMoon from JavaScript, install it in your project instead:

```bash
npm install arcmoon
```

ArcMoon needs Node.js 20.10 or newer.

## License

MIT © Adam Elmi
