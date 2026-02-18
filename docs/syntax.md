# SomMark Syntax Guide

SomMark uses three simple concepts to structure documents: **Blocks**, **Inline Statements**, and **At-Blocks**.

---

## 1. Blocks

**Blocks** are containers for content. They can hold text or other blocks inside them (nesting).

### Basic Block
Syntax: `[Identifier] ... [end]`

```ini
[Block]
This is a simple block.
[end]
```

### Block with Arguments
You can pass data to a block using arguments. You can use simple values or **Key-Value** pairs.

Syntax: `[Identifier = value, key:value] ... [end]`

```ini
[Section = id:about-us, class:dark]
(Welcome)->(h1)
This section has an ID and a class.
[end]
```

---

## 2. Inline Statements

**Inline Statements** are for small pieces of data inside text, like links, bold text, or icons.

### Basic Inline
Syntax: `(Content)->(Identifier)`

```ini
This is (bold text)->(bold).
```

### Inline with Arguments
You can pass multiple values to an inline statement using commas.

Syntax: `(Content)->(Identifier: value1, value2)`

```ini
Click (here)->(link: https://google.com, Go to Google).
```
> [!NOTE]
> Unlike block arguments, if value includes colon `:`, you do not need to escape it because inline arguments do not use key-value pairs.

> [!IMPORTANT]
> `:` is used to separate key and value so it is special token in block so escape it when it is part of the value using escape character `\`

---

## 3. At-Blocks

**At-Blocks** are for raw content like code or math. SomMark will **not** process anything inside an At-Block; it treats it as plain text.

### Basic At-Block
Syntax: `@_Identifier_@ ... @_end_@`

```ini
@_Code_@
console.log("Hello World");
@_end_@
```

### At-Block with Arguments
Arguments for At-Blocks must end with a **semicolon** (`;`).

Syntax: `@_Identifier_@: arg1, arg2; ... @_end_@`

```ini
@_Code_@: javascript;
function hello() {
  return "world";
}
@_end_@
```

---

## 4. Escape Tokens

SomMark uses the backslash `\` as an escape character. This allows you to use reserved syntax characters as literal text within your content or arguments.

## Syntax

To escape a character, simply place a backslash before it.

```sommark
\Character
```

**Note:** You cannot escape whitespace characters (spaces, tabs, newlines). The character following `\` must be a non-whitespace character.

## Common Use Cases

### Escaping Delimiters
If you need to use brackets, parentheses, or at-signs that would otherwise be interpreted as SomMark syntax.

```sommark
[Block]
This is a literal bracket: \[ and \]
This is a literal parenthesis: \( and \)
This is a literal at-block marker: \@_ and _\@
[end]
```

### Escaping Argument Separators
When passing arguments that contain commas, colons, or equals signs.

#### Escaping and colon `:` in an argument
```sommark
[Ratios = scaling:4\:3 eq: 2\:1][end]
```

#### Escaping comma `,` in an argument
```sommark
(Click Here)->(link: https://example.com/date\,time)
```
> [!NOTE]
> Unlike block arguments, if value includes colon `:`, you do not need to escape it because inline arguments do not use key-value pairs.

#### Escaping equals sign in a key-value pair
- Escape equal sign `=` if argument has a key and its value starts with equal sign `=`
```sommark
[Example = sign : =1+1]
```

#### Escaping the Escape Character
To interpret a backslash as a literal backslash, escape it with another backslash.

```js
This path uses backslashes: C:\\Windows\\System32
```
---

## Key Rules

1.  **Identifiers**: Use only letters and numbers (e.g., `Block`, `h1`, `MyComponent`).
2.  **Colons (`:`)**: Used for key-value pairs (e.g., `color:red`). If you need a real colon in your text, use a backslash to escape it: `\:`.
3.  **Semicolons (`;`)**: Only used to end the argument list in **At-Blocks**.
4.  **Flexible Spacing**: You can write blocks on one line or multiple lines.

**Multi-line Example:**
```ini
[
  Header
  class: main
]
Welcome!
[
  end
]
```
