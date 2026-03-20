# SomMark Specification

**SomMark** is a lightweight structured markup language designed to support hierarchical content, inline transformations, and raw text embedding.

SomMark provides three primary constructs:

1. **Blocks** – hierarchical containers that support nesting
2. **Inline Statements** – inline value transformations
3. **AtBlocks** – raw text containers where parsing is disabled

Additionally, SomMark supports **comments** and **escape sequences**.

---

# 1. Identifiers

Identifiers are used to name **Blocks**, **Inline Statements**, and **AtBlocks**.

## Allowed Characters

Identifiers may contain:

* Letters (`a-z`, `A-Z`)
* Numbers (`0-9`)
* Dollar sign (`$`)
* Underscore (`_`)
* Hyphen (`-`)

Example valid identifiers:

```
Block
section-1
user_profile
$template
note-2
```

Example invalid identifiers:

```
my block
test@
hello!
```

Identifiers **must not contain spaces**.

---

# 2. Blocks


Blocks are hierarchical containers that can contain other blocks, inline statements, or plain text.

Blocks are the primary structural element of SomMark.

## Block Syntax

### Block with Arguments

```
[Identifier = arg1, arg2, key:value]
Block body content...
[end]
```

Example:

```
[Note = important, level:2]
This is a note block.
[end]
```

---

### Block without Arguments

```
[Identifier]
Block body content...
[end]
```

Example:

```
[Section]
This is a section.
[end]
```

---

## Block Behavior

* Blocks **support nesting**.
* Blocks can contain:

  * plain text
  * inline statements
  * other blocks
* Arguments are optional.
* Arguments may be:

  * **positional values**
  * **key-value pairs**

Example:

```
[Article = author:Adam]

Welcome to the article.

[Section = title:Intro]
This is the introduction.
[end]

[end]
```

---

# 3. Inline Statements

Inline statements transform or process a **value** within text.

Inline statements **do not allow nested SomMark syntax**.

---

## Inline Syntax

### Inline with Arguments

```
(Value)->(Identifier: arg1, arg2, arg3)
```

Example:

```
(hello world)->(uppercase)
```

---

### Inline without Arguments

```
(Value)->(Identifier)
```

Example:

```
(hello)->(bold)
```

---

## Inline Behavior

* `(Value)` is the **input value**.
* `(Identifier)` specifies the operation.
* Inline arguments **cannot use key:value syntax**.
* Inline statements **cannot contain nested syntax**.

Example:

```
(This text)->(highlight: yellow)
```

---

# 4. AtBlocks (Raw Text Blocks)

AtBlocks are used when content must be treated as **plain text**.

No SomMark syntax inside an AtBlock is parsed.

---

## AtBlock Syntax

### AtBlock with Arguments

```
@_Identifier_@: arg1, arg2, key:value;
Raw content here.
Everything is treated as plain text.
@_end_@
```

Example:

```
@_Code_@: lang:js;

function hello(){
    console.log("hello");
}

@_end_@
```

---

### AtBlock without Arguments

```
@_Identifier_@;
content...
@_end_@
```

Example:

```
@_Raw_@;
[This will not be parsed]
(Value)->(test)
@_end_@
```

---

## AtBlock Behavior

* Content inside AtBlocks is **not parsed**.
* All characters inside are treated as **plain text**.
* Nested SomMark syntax is ignored.
* The AtBlock header **MUST end with a semicolon (`;`)**, even if no arguments are provided.

Example:

```
@_Template_@: engine:handlebars;

{{ user.name }}

@_end_@
```

---

# 5. Arguments

Arguments are used in **Blocks** and **AtBlocks**.

## Argument Types

### Positional Arguments

```
arg1, arg2, arg3
```

Example:

```
[Block = first, second]
```

---

### Key-Value Arguments

```
key:value
```

Example:

```
[Block = title:Intro, level:2]
```

---

## Argument Restrictions

Arguments may contain most characters including:

```
[
]
(
)
```

However the following characters are restricted:

### Colon (`:`)

Colon is used to separate **key-value pairs**.

Example:

```
key:value
```

If a colon must appear in a value, it must be escaped.

Example:

```
x\:y
```

Example block:

```
[Block = path:x\:y]
content
[end]
```

---

### Semicolon (`;`)

Semicolon is used **only in AtBlock arguments**.

It indicates the **end of the argument list**.

Example:

```
@_Code_@: lang:js, theme:dark;
```

Semicolons **have no special meaning** in Blocks or Inline Statements.

---

# 6. Escape Character

SomMark uses the **backslash (`\`)** as the escape character.

Escaping works similarly to JavaScript string escaping.

Example:

```
\[
```

This prevents a block from being parsed.

Example:

```
\[Not a block\]
```

Escaping can also be used inside arguments.

Example:

```
[Block = x\:y]
```

---

# 7. Comments

SomMark supports **single-line comments**.

## Syntax

```
# this is a comment
```

Everything following `#` until the end of the line is ignored by the parser.

---

## Comment Rules

Comments may appear:

* on their own line
* between blocks
* after statements

Example:

```
# Article metadata

[Article = author:Adam]

# introduction
[Section = title:Intro]
Welcome to SomMark.
[end]

[end]
```

---

## Comments Inside AtBlocks

Inside AtBlocks, comments are treated as **plain text**.

Example:

```
@_Code_@: lang:js;

# This line is not treated as a comment
console.log("Hello")

@_end_@
```

---

# 8. Non-Empty Content Rules

The following elements **must not be empty**:

* Block body
* AtBlock body
* Inline value

Invalid examples:

```
()->(Identifier)
```

---

# 9. Flexible Formatting

SomMark allows flexible formatting and whitespace.

The following are equivalent.

## Compact Format

```
[Block]Hello World[end]
```

## Expanded Format

```
[
Block
]

Hello World

[
end
]
```

Inline and AtBlocks follow similar whitespace flexibility.

---

# 10. Construct Summary

| Construct        | Nesting | Arguments | Key-Value Args | Parsing    |
| ---------------- | ------- | --------- | -------------- | ---------- |
| Block            | Yes     | Optional  | Yes            | Parsed     |
| Inline Statement | No      | Optional  | No             | Parsed     |
| AtBlock          | No      | Optional  | Yes            | Not parsed (Header ends with `;`) |
| Comment          | No      | No        | No             | Parsed but ignored by built-in "comment-remover" plugin during AST |

