import TOKEN_TYPES from "./tokenTypes.js";
import fs from "node:fs/promises";

const buffer = await fs.readFile("./Core/example.smark");
const file_content = buffer.toString();

let BLOCK_STACK = [];
let INLINE_STACK = [];
let AT_STACK = [];

function peek(input, index, offset) {
  if (index + offset < input.length) {
    return input[index + offset];
  }
  return null;
}

function concat_char(input, index, mode = "normal", stop_at_char = []) {
  let str = "";
  for (let char_index = index; char_index < input.length; char_index++) {
    let char = input[char_index];
    if (mode === "normal") {
      if (
        char === "\n" ||
        (char === "[" && peek(input, char_index, 1) !== "_") ||
        (char === "(" && peek(input, char_index, 1) !== "_") ||
        (char === ")" && peek(input, char_index, 1) !== "_") ||
        (char === "@" &&
          peek(input, char_index, 1) === "_" &&
          peek(input, char_index, 2) !== "_") ||
        (char === "_" &&
          peek(input, char_index, 1) !== "_" &&
          peek(input, char_index, 2) !== "@" &&
          peek(input, char_index, 2) === "@") ||
        (char === "#" && peek(input, char_index, 1) !== "_")
      ) {
        break;
      }
      str += char;
    } else {
      if (stop_at_char.includes(char)) {
        break;
      }
      str += char;
    }
  }

  return str;
}
/*
(run)->(true)
*/
function lexer(src) {
  if (src && typeof src === "string") {
    const tokens = [];
    let line = 1;
    let column_start = 1,
      column_end = 1;
    let depth_index = 0;
    const add_token = (type, value, depth = depth_index) => {
      tokens.push({ type, value, line, column_start, column_end, depth });
    };
    let context = "";
    let temp_str = "";

    for (let i = 0; i < src.length; i++) {
      let current_char = src[i];
      // Token: Open Bracket
      if (
        current_char === "[" &&
        BLOCK_STACK.length === 0 &&
        peek(src, i, 1) !== "_"
      ) {
        column_start = i + 1;
        column_end = column_start;
        if (peek(src, i, 1) + peek(src, i, 2) + peek(src, i, 3) !== "end") {
          depth_index += 1;
        }
        add_token(TOKEN_TYPES.OPEN_BRACKET, current_char);
        BLOCK_STACK.push(current_char);
      }
      // Token: Equal Sign
      else if (current_char === "=" && BLOCK_STACK.includes("[")) {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.EQUAL, current_char);
        BLOCK_STACK.push(current_char);
      }
      // Token: Close Bracket
      else if (
        (current_char === "]" &&
          i === src.length - 1 &&
          BLOCK_STACK.length > 0 &&
          BLOCK_STACK[0] === "[" &&
          (BLOCK_STACK[1] === "Block Identifier" ||
            BLOCK_STACK[1] === "end")) ||
        (current_char === "]" &&
          BLOCK_STACK.length > 0 &&
          BLOCK_STACK[0] === "[" &&
          (BLOCK_STACK[1] === "Block Identifier" || BLOCK_STACK[1] === "end"))
      ) {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.CLOSE_BRACKET, current_char);
        console.log(BLOCK_STACK);
        BLOCK_STACK = [];
      }
      // Token: Open Parenthesis
      else if (
        current_char === "(" &&
        peek(src, i, 1) !== "_" &&
        (INLINE_STACK.length === 0 || INLINE_STACK.includes("("))
      ) {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.OPEN_PAREN, current_char);
        INLINE_STACK.push(current_char);
      }
      // Token: Thin Arrow
      else if (
        current_char === "-" &&
        INLINE_STACK[0] === "(" &&
        peek(src, i, 1) === ">" &&
        peek(src, i, 2) === "("
      ) {
        column_start = i + 1;
        add_token(TOKEN_TYPES.THIN_ARROW, current_char + peek(src, i, 1));
        INLINE_STACK.push(current_char + peek(src, i, 1));
        i += (current_char + peek(src, i, 1)).length - 1;
        current_char = src[i];
        column_end = i + 1;
      }
      // Token: Close Parenthesis
      else if (
        (current_char === ")" &&
          peek(src, i, 1) === "-" &&
          peek(src, i, 2) === ">") ||
        (current_char === ")" &&
          INLINE_STACK[2] === "->" &&
          INLINE_STACK[3] === "(") ||
        (INLINE_STACK.length === 6 &&
          INLINE_STACK[4] === "(" &&
          INLINE_STACK[5] === "Inline Identifier")
      ) {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.CLOSE_PAREN, current_char);
        INLINE_STACK.push(current_char);
        if (INLINE_STACK.length === 7) {
          INLINE_STACK = [];
        } else {
          INLINE_STACK.push(current_char);
        }
      }
      // Token: Open At (@_)
      else if (
        current_char === "@" &&
        peek(src, i, 1) === "_" &&
        peek(src, i, 2) !== "_"
      ) {
        column_start = i + 1;
        add_token(TOKEN_TYPES.OPEN_AT, current_char + peek(src, i, 1));
        AT_STACK.push(current_char + peek(src, i, 1));
        i += (current_char + peek(src, i, 1)).length - 1;
        current_char = src[i];
        column_end = i + 1;
      }
      // Token: Close At (_@)
      else if (
        current_char === "_" &&
        peek(src, i, 1) === "@" &&
        AT_STACK.length > 0 &&
        AT_STACK[0] === "@_"
      ) {
        column_start = i + 1;
        add_token(TOKEN_TYPES.CLOSE_AT, current_char + peek(src, i, 1));
        AT_STACK.push(current_char + peek(src, i, 1));
        if (AT_STACK.includes("end")) {
          AT_STACK = [];
        }
        i += (current_char + peek(src, i, 1)).length - 1;
        current_char = src[i];
        column_end = i + 1;
      }
      // Token: Colon
      else if (AT_STACK.length === 3 && current_char === ":") {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.COLON, current_char);
        AT_STACK.push(current_char);
      }
      // Token: End Keyword
      else if (
        ((BLOCK_STACK.length === 1 && BLOCK_STACK[0] === "[") ||
          (AT_STACK.length === 1 && AT_STACK[0] === "@_")) &&
        current_char === "e" &&
        peek(src, i, 1) === "n" &&
        peek(src, i, 2) === "d"
      ) {
        column_start = i + 1;
        add_token(
          TOKEN_TYPES.END_KEYWORD,
          current_char + peek(src, i, 1) + peek(src, i, 2),
        );
        BLOCK_STACK.push(current_char + peek(src, i, 1) + peek(src, i, 2));
        AT_STACK.push(current_char + peek(src, i, 1) + peek(src, i, 2));
        i += (current_char + peek(src, i, 1) + peek(src, i, 2)).length - 1;
        current_char = src[i];
        column_end = i + 1;
      }
      // Token: Newline (\n)
      else if (current_char === "\n") {
        line += 1;
        column_start = 1;
        column_end = 1;
        add_token(TOKEN_TYPES.NEWLINE, current_char);
      } else {
        // Token: Block Identifier
        if (BLOCK_STACK.length === 1 && BLOCK_STACK[0] === "[") {
          column_start = i + 1;
          temp_str = concat_char(src, i, "active", ["=", "]"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
          }
          add_token(TOKEN_TYPES.BLOCK_IDENTIFIER, temp_str);
          BLOCK_STACK.push("Block Identifier");
        }
        // Token: Value (Block Value)
        else if (
          (BLOCK_STACK.length === 3 &&
            BLOCK_STACK[0] === "[" &&
            BLOCK_STACK[1] === "Block Identifier",
          BLOCK_STACK[2] === "=")
        ) {
          temp_str = concat_char(src, i, "active", ["]"]);
          if (temp_str) {
            column_start = i + 1;
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
          }
          add_token(TOKEN_TYPES.VALUE, temp_str);
          BLOCK_STACK.push("Block Value");
        }
        // Token: Value (Inline Value)
        else if (INLINE_STACK.length === 1 && INLINE_STACK[0] === "(") {
          column_start = i + 1;
          temp_str = concat_char(src, i, "active", [")"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
          }
          add_token(TOKEN_TYPES.VALUE, temp_str);
          INLINE_STACK.push("Inline Value");
        }
        // Token: Inline Identifier
        else if (INLINE_STACK.length === 5 && INLINE_STACK[4] === "(") {
          column_start = i + 1;
          temp_str = concat_char(src, i, "active", [")"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
          }
          add_token(TOKEN_TYPES.INLINE_IDENTIFIER, temp_str);
          INLINE_STACK.push("Inline Identifier");
        }
        // Token: At Identifier
        else if (AT_STACK.length === 1 && AT_STACK[0] === "@_") {
          column_start = i + 1;
          temp_str = concat_char(src, i, "active", ["@", "_"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
          }
          add_token(TOKEN_TYPES.AT_IDENTIFIER, temp_str);
          AT_STACK.push("At Identifier");
        }
        // Token: Value (At Value)
        else if (AT_STACK.length === 4 && !AT_STACK.includes("end")) {
          column_start = i + 1;
          temp_str = concat_char(src, i, "active", [":", "\n"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
          }
          add_token(TOKEN_TYPES.VALUE, temp_str);
          if (AT_STACK.length === 4) {
            AT_STACK = [];
          }
        }
        // Token: Comment
        else if (current_char === "#" && peek(src, i, 1) !== "_") {
          temp_str = concat_char(src, i, "active", ["\n"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
          }
          add_token(TOKEN_TYPES.COMMENT, temp_str);
        }
        // Token: Content (anything else)
        else {
          column_start = i + 1;
          context = concat_char(src, i);
          if (context) {
            i += context.length - 1;
            current_char = src[i];
            column_end = i + 1;
          }
          if (context.trim()) {
            add_token(TOKEN_TYPES.CONTENT, context);
          }
        }
      }
      context = "";
      temp_str = "";
    }
    console.log(tokens);
    return tokens;
  } else {
    throw new Error("Invalid Source Code");
  }
}

lexer(file_content);
