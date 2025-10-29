import TOKEN_TYPES from "./tokenTypes.js";
import fs from "node:fs/promises";

const buffer = await fs.readFile("./Core/example.smark");
const file_content = buffer.toString();

let BLOCK_STACK = [];
let INLINE_STACK = [];
let AT_STACK = [];
let prev_special_token = "";

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
        (char === "(" && peek(input, char_index, 1) !== "_") ||
        (char === ")" && peek(input, char_index, 1) !== "_") ||
        (char === "@" && peek(input, char_index, 1) === "_") ||
        (char === "_" && peek(input, char_index, 1) === "@")
      ) {
        break;
      }
      str += char;
    } else {
      if (char === "=" || char === "]" || char === "(") {
        prev_special_token = char;
      }
      if (
        char === ")" &&
        peek(input, char_index, 1) === "-" &&
        peek(input, char_index, 2) === ">"
      ) {
        prev_special_token = char;
      }
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
    const add_token = (type, value) => {
      tokens.push({ type, value, line, column_start, column_end });
    };
    let context = "";
    let temp_str = "";

    for (let i = 0; i < src.length; i++) {
      let current_char = src[i];
      if (
        current_char === "[" &&
        BLOCK_STACK.length === 0 &&
        peek(src, i, 1) !== "_"
      ) {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.OPEN_BRACKET, current_char);
        BLOCK_STACK.push(current_char);
        prev_special_token = current_char;
      } else if (current_char === "=" && BLOCK_STACK.includes("[")) {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.EQUAL, current_char);
        BLOCK_STACK.push(current_char);
      } else if (
        current_char === "]" &&
        BLOCK_STACK.includes("[") &&
        peek(src, i, 1) === "\n"
      ) {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.CLOSE_BRACKET, current_char);
        BLOCK_STACK = [];
      } else if (
        current_char === "(" &&
        peek(src, i, 1) !== "_" &&
        (INLINE_STACK.length === 0 || INLINE_STACK.includes("("))
      ) {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.OPEN_PAREN, current_char);
        INLINE_STACK.push(current_char);
      } else if (
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
      } else if (
        (current_char === ")" &&
          peek(src, i, 1) === "-" &&
          peek(src, i, 2) === ">") ||
        (current_char === ")" &&
          INLINE_STACK[2] === "->" &&
          INLINE_STACK[3] === "(")
      ) {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.CLOSE_PAREN, current_char);
        if (INLINE_STACK[2] === "->" && INLINE_STACK[3] === "(") {
          INLINE_STACK = [];
        } else {
          INLINE_STACK.push(current_char);
        }
      } else if (
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
      } else if (
        current_char === "_" &&
        peek(src, i, 1) === "@" &&
        AT_STACK.length > 0 &&
        AT_STACK[0] === "@_"
      ) {
        column_start = i + 1;
        add_token(TOKEN_TYPES.CLOSE_AT, current_char + peek(src, i, 1));
        AT_STACK.push(current_char + peek(src, i, 1));
        i += (current_char + peek(src, i, 1)).length - 1;
        current_char = src[i];
        column_end = i + 1;
      } else if (AT_STACK.length === 2 && current_char === ":") {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.COLON, current_char);
        AT_STACK.push(current_char);
      } else if (
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
        i += (current_char + peek(src, i, 1) + peek(src, i, 2)).length - 1;
        current_char = src[i];
        column_end = i + 1;
      } else if (current_char === "\n") {
        line += 1;
        column_start = 1;
        column_end = 1;
        add_token(TOKEN_TYPES.NEWLINE, current_char);
      } else {
        if (prev_special_token === "[") {
          column_start = i + 1;
          temp_str = concat_char(src, i, "active", ["=", "]"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
          }
          add_token(TOKEN_TYPES.BLOCK_IDENTIFIER, temp_str);
        } else if (
          BLOCK_STACK.length > 0 &&
          BLOCK_STACK[1] === "=" &&
          prev_special_token === "="
        ) {
          temp_str = concat_char(src, i, "active", ["]"]);
          if (temp_str) {
            column_start = i + 1;
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
          }
          add_token(TOKEN_TYPES.VALUE, temp_str);
        } else if (INLINE_STACK.length === 1) {
          column_start = i + 1;
          temp_str = concat_char(src, i, "active", ["(", ")"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
          }
          add_token(TOKEN_TYPES.INLINE_IDENTIFIER, temp_str);
        } else if (INLINE_STACK.length === 4) {
          column_start = i + 1;
          temp_str = concat_char(src, i, "active", ["(", ")"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
          }
          add_token(TOKEN_TYPES.VALUE, temp_str);
        } else if (AT_STACK.length === 1) {
          column_start = i + 1;
          temp_str = concat_char(src, i, "active", ["@", "_"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
          }
          add_token(TOKEN_TYPES.AT_IDENTIFIER, temp_str);
        } else if (AT_STACK.length === 3) {
          column_start = i + 1;
          temp_str = concat_char(src, i, "active", [":", "\n"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
          }
          add_token(TOKEN_TYPES.VALUE, temp_str);
          if (AT_STACK.length === 3) {
            AT_STACK = [];
          }
        } else {
          column_start = i + 1;
          context = concat_char(src, i);
          if (context) {
            i += context.length - 1;
            current_char = src[i];
            column_end = i + 1;
          }
          add_token(TOKEN_TYPES.CONTENT, context);
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
