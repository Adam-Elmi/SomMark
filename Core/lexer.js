import TOKEN_TYPES from "./tokenTypes.js";
import fs from "node:fs/promises";

const buffer = await fs.readFile("./Core/example.smark");
const file_content = buffer.toString();

let BLOCK_STACK = [];
let INLINE_STACK = [];
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
      if (char === "\n" || (char === "(" && peek(input, char_index, 1) !== "_") ||  (char === ")" && peek(input, char_index, 1) !== "_")) {
        break;
      }
      str += char;
    } else {
      if (char === "=" || char === "]" || char === "(") {
        prev_special_token = char;
      }
      if(char === ")" && peek(input, char_index, 1) === "-" && peek(input, char_index, 2) === ">") {
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
    const add_token = (type, value) => {
      tokens.push({ type, value });
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
        add_token(TOKEN_TYPES.OPEN_BRACKET, current_char);
        BLOCK_STACK.push(current_char);
        prev_special_token = current_char;
      } else if (current_char === "=" && BLOCK_STACK.includes("[")) {
        add_token(TOKEN_TYPES.EQUAL, current_char);
        BLOCK_STACK.push(current_char);
      } else if (
        current_char === "]" &&
        BLOCK_STACK.includes("[") &&
        peek(src, i, 1) === "\n"
      ) {
        add_token(TOKEN_TYPES.CLOSE_BRACKET, current_char);
        BLOCK_STACK = [];
      } else if (current_char === "\n") {
        add_token(TOKEN_TYPES.NEWLINE, current_char);
      } else if (
        current_char === "(" && peek(src, i, 1) !== "_" &&
        (INLINE_STACK.length === 0 || INLINE_STACK.includes("("))
      ) {
        add_token(TOKEN_TYPES.OPEN_PAREN, current_char);
        INLINE_STACK.push(current_char);
      } else if (
        current_char === "-" &&
        INLINE_STACK[0] === "(" &&
        peek(src, i, 1) === ">" &&
        peek(src, i, 2) === "("
      ) {
        add_token(TOKEN_TYPES.THIN_ARROW, current_char + peek(src, i, 1));
        INLINE_STACK.push(current_char + peek(src, i, 1));
        i += (current_char + peek(src, i, 1)).length - 1;
        current_char = src[i];
      } else if (
        (current_char === ")" &&
          peek(src, i, 1) === "-" &&
          peek(src, i, 2) === ">") ||
        (current_char === ")" && INLINE_STACK[2] === "->" && INLINE_STACK[3] === "(")
      ) {
        add_token(TOKEN_TYPES.CLOSE_PAREN, current_char);
        if (INLINE_STACK[2] === "->" && INLINE_STACK[3] === "(") {
          INLINE_STACK = [];
        } else {
          INLINE_STACK.push(current_char);
        }
      } else {
        if (prev_special_token === "[") {
          temp_str = concat_char(src, i, "active", ["=", "]"]);
          if (temp_str) {
            i += temp_str.length - 1;
          }
          if (temp_str.trim() === "end") {
            add_token(TOKEN_TYPES.END_KEYWORD, temp_str);
          } else {
            add_token(TOKEN_TYPES.BLOCK_IDENTIFIER, temp_str);
          }
        } else if (prev_special_token === "=") {
          temp_str = concat_char(src, i, "active", ["]"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
          }
          add_token(TOKEN_TYPES.VALUE, temp_str);
        } else if (INLINE_STACK.length === 1) {
          temp_str = concat_char(src, i, "active", ["(", ")"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
          }
          add_token(TOKEN_TYPES.INLINE_IDENTIFIER, temp_str);
        } 
        else if (INLINE_STACK.length === 4) {
          temp_str = concat_char(src, i, "active", ["(", ")"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
          }
          add_token(TOKEN_TYPES.VALUE, temp_str);
        } 
        else {
          context = concat_char(src, i);
          if (context) {
            i += context.length - 1;
            current_char = src[i];
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
