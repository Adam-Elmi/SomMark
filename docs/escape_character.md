# Escape Tokens

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

```sommark
// Escaping comma in an argument
(Click Here)->(link: https://example.com/foo\,bar)

// Escaping equals sign in a key-value pair
[Div=data:formula\=x+y]
```

### Escaping the Escape Character
To interpret a backslash as a literal backslash, escape it with another backslash.

```sommark
This path uses backslashes: C:\\Windows\\System32
```
