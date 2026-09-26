<p align="center">
  <img src="assets/arcmoon-logo.svg" alt="ArcMoon logo" width="120">
</p>

<h1 align="center">ArcMoon</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/arcmoon"><img src="https://img.shields.io/npm/v/arcmoon/beta?color=d9263f&label=npm" alt="npm version"></a>
  <img src="https://img.shields.io/badge/license-MIT-3b82f6" alt="MIT license">
  <img src="https://img.shields.io/badge/node-%3E%3D20.10-339933?logo=node.js&logoColor=white" alt="Node.js 20.10 or newer">
</p>

<p align="center">ArcMoon is a template language. You write <code>.arcm</code> files, and ArcMoon turns them into HTML pages.</p>

> **Beta.** ArcMoon works, but things may change before 1.0.

---

## Get started

### 1. Install ArcMoon

```bash
npm install -g arcmoon@beta
```

This gives you two commands that do the same thing: `arcmoon` and its short name `arcm`. This README uses `arcm`. Check it:

```bash
arcm -v
```

### 2. Make a project

```bash
mkdir my-site
cd my-site
arcm init
mkdir pages
```

`arcm init` creates `arcmoon.config.js`, the settings file. Your pages go in `pages/`.

### 3. Write a page

Create `pages/index.arcm`:

```ini
[doctype!]
[html = lang: "en"]
  [head]
    [title]My site[end]
  [end]
  [body]
    [h1]Hello![end]
    [p]This page was made with ArcMoon.[end]
  [end]
[end]
```

### 4. Build it

```bash
arcm build pages
```

Now open `dist/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <title>My site</title>
  </head>
  <body>
    <h1>Hello!</h1>
    <p>This page was made with ArcMoon.</p>
  </body>
</html>
```

Every `.arcm` file in `pages/` becomes an `.html` file in `dist/`.

---

## Learn ArcMoon

Each step adds one idea. Try them in your `pages/` folder.

### 1. Blocks

A block is `[name]…[end]`. Any HTML tag works.

```ini
[h1]Title[end]
[p]Some text with [strong]bold[end] words.[end]
```

A block with no content ends with `!`:

```ini
[br!]
[img = src: "cat.jpg", alt: "A cat" !]
```

### 2. Props

Props go after `=`. They become HTML attributes.

```ini
[a = href: "/about.html", class: "link"]About[end]
[input = type: "checkbox", checked: true !]
[img = src: "cat.jpg", width: 200 !]
```

```html
<a href="/about.html" class="link">About</a>
<input type="checkbox" checked>
<img src="cat.jpg" width="200">
```

Text goes in quotes. `true`, `false` and numbers don't need quotes.

### 3. Comments

```ini
# One line

###
  Many
  lines
###
```

Comments are not written to the HTML.

### 4. Components

A component is another `.arcm` file. Make `components/Card.arcm`:

```ini
${ const { title } = ArcMoon.props(); }$
[div = class: "card"]
  [h2]${ title }$[end]
  [slot!]
[end]
```

- `ArcMoon.props()` gives the props the page passes in.
- `[slot!]` is where the page's content goes.

Use it in a page:

```ini
[import = Card: "../components/Card.arcm" !]

[Card = title: "Hello"]This goes in the slot.[end]
[Card = title: "Again"]So does this.[end]
```

```html
<div class="card">
  <h2>Hello</h2>
  This goes in the slot.
</div>

<div class="card">
  <h2>Again</h2>
  So does this.
</div>
```

### 5. Layouts

A layout is a component that holds the whole page. Make `components/Layout.arcm`:

```ini
${ const { title } = ArcMoon.props(); }$
[doctype!]
[html = lang: "en"]
  [head][title]${ title }$[end][end]
  [body]
    [nav][a = href: "index.html"]Home[end][end]
    [slot!]
  [end]
[end]
```

Now each page is short:

```ini
[import = Layout: "../components/Layout.arcm" !]

[Layout = title: "About"]
  [h1]About me[end]
[end]
```

### 6. Code at build time

Code inside `${ }$` runs when you build, in Node.js. Its result is written into the page.

```ini
${ const name = "Adam"; }$

[p]Hello, ${ name }$![end]
[p]2 + 2 = ${ 2 + 2 }$[end]
[p]Built on ${ new Date().toDateString() }$[end]
```

You can read files and use npm packages:

```ini
${
  import { readFile } from "node:fs/promises";
  const about = await readFile("./about.txt", "utf8");
}$

[p]${ about }$[end]
```

This code never goes to the browser. Only its result does.

### 7. Loops

`[for-each]` repeats its content for each item. `i` is the position, starting at 0.

```ini
${ const languages = ["JavaScript", "Python", "Lua"]; }$

[ul]
  [for-each = ${ languages }$, as: "language"]
    [li]${ i + 1 }$. ${ language }$[end]
  [end]
[end]
```

This makes a list with three items: `1. JavaScript`, `2. Python` and `3. Lua`.

Data can come from a JSON file:

```ini
${ import posts from "../posts.json"; }$

[for-each = ${ posts }$, as: "post"]
  [a = href: ${ post.url }$]${ post.title }$[end]
[end]
```

### 8. Code in the browser

Code inside `runtime ${ }$` runs in the browser, after the page loads.

```ini
[button = onclick: runtime ${ () => alert("Hi!") }$]Say hi[end]
```

### 9. Live values

A **signal** is a value that can change. When it changes, the page updates.

```ini
runtime ${
  import { signal } from "arcmoon/reactive";
  const count = signal(0);
}$

[button = onclick: runtime ${ () => count(count() + 1) }$]
  Clicked runtime ${ count() }$ times
[end]
```

- `count()` reads the value.
- `count(5)` sets it.
- `runtime ${ count() }$` in the page shows it, and keeps it up to date.

Props can be live too:

```ini
runtime ${
  import { signal } from "arcmoon/reactive";
  const on = signal(false);
}$

[button = onclick: runtime ${ () => on(!on()) }$]Switch[end]
[p = class: runtime ${ on() ? "light on" : "light" }$]The light[end]
```

### 10. Refs

A ref lets browser code find an element by name.

```ini
[input = arcm-ref: "name", placeholder: "Your name" !]
[button = arcm-ref: "go"]Focus[end]

runtime ${
  const input = ArcMoon.ref(ArcMoon.defineRef("name"));
  const button = ArcMoon.ref(ArcMoon.defineRef("go"));
  button.onclick = () => input.focus();
}$
```

For many elements, use `arcm-shared-ref` and `ArcMoon.refs()`.

### 11. npm packages in the browser

First add the package to `bundle` in `arcmoon.config.js`:

```js
export default {
  bundle: ["canvas-confetti"]
};
```

Then import it in browser code:

```ini
runtime ${ import confetti from "canvas-confetti"; }$

[button = onclick: runtime ${ () => confetti() }$]Party[end]
```

Only packages in `bundle` can go to the browser.

### 12. Styles

A `[style]` in a **page** styles the whole page:

```ini
[style]
  body { font-family: sans-serif; }
[end]
```

A `[style]` in a **component** styles only that component:

```ini
# components/Badge.arcm
[span = class: "badge"][slot!][end]

[style]
  .badge { padding: 2px 8px; border-radius: 99px; background: gold; }
[end]
```

Another `.badge` somewhere else on the page is not changed.

### 13. CSS variables as props

A prop that starts with `--` sets a CSS variable:

```ini
[div = class: "box", --size: "80px"][end]

[style]
  .box { width: var(--size); height: var(--size); background: tomato; }
[end]
```

It can be live:

```ini
runtime ${
  import { signal } from "arcmoon/reactive";
  const size = signal(80);
}$

[button = onclick: runtime ${ () => size(size() + 20) }$]Bigger[end]
[div = class: "box", --size: runtime ${ size() + "px" }$][end]
```

---

## Commands

| Command | What it does |
| --- | --- |
| `arcm build pages` | Build every page in `pages/` into `dist/` |
| `arcm build pages/index.arcm` | Build one page |
| `arcm build pages -o public` | Build into `public/` instead |
| `arcm build pages/index.arcm -p` | Print the HTML, don't save it |
| `arcm init` | Create `arcmoon.config.js` |
| `arcm audit pages` | Show what other people's templates do |
| `arcm trust pages` | Trust those templates |
| `arcm -v` | Show the version |

## Settings

`arcmoon.config.js`:

```js
export default {
  importAliases: { "@": "./components" },   // [import = Card: "@/Card.arcm" !]
  bundle: [],                               // npm packages for the browser
  outDir: "./dist",                         // where HTML goes
  externalScripts: false,                   // true: JS in separate files
  externalStyles: false                     // true: CSS in separate files
};
```

## Templates from other people

Before ArcMoon runs a template you didn't write, it checks what the code does:

```
⚠ Template "../theme" is not trusted. It would:
    import     node:child_process, node:fs (read/write)
    risky      child_process, fs (write)
    fetch      evil.example
    env        GITHUB_TOKEN

  Review it, then run "arcmoon trust ../theme".

  Nothing was run.
```

Nothing runs until you trust it.

## Use ArcMoon from JavaScript

Install it in your project:

```bash
npm install arcmoon@beta
```

In Node.js:

```js
import ArcMoon from "arcmoon";

const html = await new ArcMoon({ filename: "pages/index.arcm" }).compile();
```

In the browser, `render()` gives real elements:

```js
import ArcMoon from "arcmoon";

const nodes = await new ArcMoon({ src: "[p]Hi![end]" }).render();
document.body.append(nodes);
```

## License

MIT © Adam Elmi
