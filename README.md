
<img width="2000" height="491" alt="SomMark Cover" src="https://raw.githubusercontent.com/Adam-Elmi/SomMark/master/assets/smark_bg.png" />



<p align="center">
  SomMark is a lightweight, custom documentation markup language designed to be simple, readable, and easy to process.
</p>

<p align="center">
  <span>Website (Coming Soon)</span>
  ·
  <span>Docs (Coming Soon)</span>
  ·
  <span>Community (Coming Soon)</span>
</p>


<p align="center">
<img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />
<img src="https://img.shields.io/badge/version-v1.0.0-blue?style=flat-square" />
<img src="https://img.shields.io/badge/type-markup%20language-purple?style=flat-square" />
<img src="https://img.shields.io/badge/html-supported-orange?style=flat-square" />
<img src="https://img.shields.io/badge/markdown-supported-lightyellow?style=flat-square" />
<img src="https://img.shields.io/badge/mdx-supported-lightblue?style=flat-square" />

</p>

---

# SomMark v1

SomMark is a simple and extensible markup language designed for writing documentation and structured content. It is easy to read, easy to parse, and easy to convert into formats like HTML, Markdown, and MDX.

SomMark is built around **clear syntax**, **explicit structure**, and a **mapping-based output system**.

---

## Core Syntax

SomMark has **three main syntax types**.

---

## 1. Block

A **Block** is a container.
It holds arguments and child content.

```ini
[Section = arg1, arg2, arg3]
This is the body.
These texts are considered as children.
[end]
```

* `Section` is the block name
* Arguments are optional
* Everything inside is treated as block content

---

## 2. Inline Statement

An **Inline Statement** is used inside text to apply formatting or behavior such as color, links, or styles.

```ini
[Section]
This is the (text)->(color:red).
These words are (important)->(bold).
[end]
```

Inline statements modify specific parts of text without breaking the flow.

---

## 3. At Block

Sometimes inline statements are not enough.
**At Blocks** are used for complex structures like tables, lists, code blocks, and custom content.

```ini
[Section]
@_table_@: month, revenue, expenses
- January, 1200, 400
- February, 1400, 600
- March, 2000, 800
@_end_@

@_code_@: lua
function add(a, b)
  return a + b
end
@_end_@
[end]
```

At Blocks give you full control over how structured data is handled.

---

## Modes

SomMark has **two modes**:

### Default Mode

* Comes with predefined identifiers such as `table`, `code`, `list`, and more
* Can be directly transpiled to HTML or Markdown
* Ideal for documentation

### Custom Mode

* You define your own identifiers
* Full control over behavior and output
* Useful for custom formats or tools

---

## Mapping Concept

SomMark uses a **mapping system**.

* You define how each block, inline statement, or at-block should be converted
* Output is not fixed
* The same SomMark file can generate different results (HTML, MD, MDX, etc.)

This makes SomMark highly extensible and future-proof.

---

## Escape Character

To prevent SomMark from parsing syntax, use the escape character (`` ` ``):

```ini
[Section]
This is a text `[Hello]` not a block.
Also this `(world)` is not inline syntax.
[end]
```

Escaped content is treated as plain text.

---

## Purpose

SomMark is designed for:

* Documentation
* Structured writing
* Tooling and transpilation
* Extensible content systems