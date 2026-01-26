# SomMark v2 To-Do List
Target Release: Feb 1

## Core Architecture

- [x] **Implement flexible syntax for Inline Statements**
    *Allow ignoring newlines and whitespaces so the following syntax works:*
    ```ini
    (
    Hello
    )
    ->
    (
    bold
    )
    ```

- [x] **Implement flexible syntax for Block definitions**
    *Allow multi-line headers for blocks so the following syntax works:*
    ```ini
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
    *Update parser to require a semicolon `;` at the end of arguments to support multi-line headers:*
    ```ini
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
    *Treat the comma `,` as a distinct token type (e.g., `TOKEN_COMMA`)*

- [x] **Refactor Inline Statements (Multi-Value Support)**
    *Update syntax to support identifiers with multiple comma-separated values:*
    ```sommark
    // Single identifier
    (Text)->(bold)

    // Identifier with multiple values
    (Text)->(gradient: red, blue, green)
    ```

## Features
    
- [x] **Implement Escape Character Support in Arguments**
    *Allow escaping special characters inside argument values using a backslash.*
    *Example: `title:SomMark\:v2, the best tool`*

- [ ] **Implement Text Output Rendering**
    *Add functionality to render pure text output.*

- [x] **Implement Key-Value (Named) Arguments for Blocks and Atblocks**
  *Enable targeting arguments by key to allow order-independent and optional arguments.*
    
  **Syntax Example:**
  ```ini
    @_Text_@: title:SomMark, description:SomMark is a markup language;
    Welcome to SomMark!
    @_end_@
  ```
    
  **Mapper Implementation Logic:**
  *Arguments should be accessible by both Key and Index for safety:*
  ```javascript
  // If user provides only 'description':
  args["description"] // Returns "SomMark is a markup language" (Safe)
  args[0]             // Returns "SomMark is a markup language" (Fallback)
