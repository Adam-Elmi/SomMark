# SomMark v2 To-Do List

Target Release: Feb 1

## Core Architecture

- [x] **Implement flexible syntax for Inline Statements**
      _Allow ignoring newlines and whitespaces so the following syntax works:_

  ```text
  (
  Hello
  )
  ->
  (
  bold
  )
  ```

- [x] **Implement flexible syntax for Block definitions**
      _Allow multi-line headers for blocks so the following syntax works:_

  ```text
  [
  Block
  =
  arg1
  ,
  arg2,
  arg3
  ]
  This is the block body.
  [
  end
  ]
  ```

- [x] **Implement Breaking Change for Atblocks (Semicolon Terminator)**
      _Update parser to require a semicolon `;` at the end of arguments to support multi-line headers:_

  ```text
  @_
  table
  _@
  :
  Name
  ,
  Age
  ,
  Id
  ;
  Adam, 25, 101
  Elmi, 26, 202
  @_
  end
  _@
  ```

- [x] **Refactor Lexer to Tokenize Commas**
      _Treat the comma `,` as a distinct token type (e.g., `TOKEN_COMMA`)_

- [x] **Refactor Inline Statements (Multi-Value Support)**
      _Update syntax to support identifiers with multiple comma-separated values:_

  ```text
  // Single identifier
  (Text)->(bold)

  // Identifier with multiple values
  (Text)->(gradient: red, blue, green)
  ```

## Features

- [x] **Implement Escape Character Support in Arguments**
      _Allow escaping special characters inside argument values using a backslash._
      _Example: `title:SomMark\:v2, the best tool`_

- [x] **Implement Key-Value (Named) Arguments for Blocks and Atblocks**
      _Enable targeting arguments by key to allow order-independent and optional arguments._

  **Syntax Example:**

  ```text
    @_Text_@: title:SomMark, description:SomMark is a markup language;
    Welcome to SomMark!
    @_end_@
  ```

  **Mapper Implementation Logic:**
  _Arguments should be accessible by both Key and Index for safety:_

  ```javascript
  // If user provides only 'description':
  args["description"]; // Returns "SomMark is a markup language" (Safe)
  args[0]; // Returns "SomMark is a markup language" (Fallback)
  ```

- [ ] **Implement Text Output Rendering**
      _Add functionality to render pure text output._

- [ ] **Implement Mapper Self-Rules (Validation)**
      _Allow mapper files to define validation rules for arguments and content. The transpiler must throw an error if rules are violated._

## Improvements

- [ ] **Improve Mapper Logic.**
- [ ] **Improve API References.**

## Testing

- [ ] **Update Tests for New Syntax.**
- [ ] **Add Tests for New Features.**
