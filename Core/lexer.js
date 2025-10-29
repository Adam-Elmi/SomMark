import TOKEN_TYPES from "./tokenTypes.js";
import fs from "node:fs/promises";

const buffer = await fs.readFile("./Core/example.smark");
const file_content = buffer.toString();

let BLOCK_STACK = [];

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
     if(char === "\n") {
       break;
     }
        str += char;
    } else {
      if (char === "=" || char === "]") {
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
      console.log("Prev token: ", BLOCK_STACK)
      if (current_char === "[" && BLOCK_STACK.length === 0) {
        add_token(TOKEN_TYPES.OPEN_BRACKET, current_char);
        BLOCK_STACK.push(current_char);
        prev_special_token = current_char;
      } else if (current_char === "=" && BLOCK_STACK.includes("[")) {
        add_token(TOKEN_TYPES.EQUAL, current_char);
        BLOCK_STACK.push(current_char);
      } else if (current_char === "]" && BLOCK_STACK.includes("[")) {
        add_token(TOKEN_TYPES.CLOSE_BRACKET, current_char);
        BLOCK_STACK = [];
      } else if (current_char === "\n") {
        add_token(TOKEN_TYPES.NEWLINE, current_char);
      } else {
        if (prev_special_token === "[") {
          temp_str = concat_char(src, i, "active", ["=", "]"]);
          if (temp_str) {
            i += temp_str.length - 1;
          }
          if(temp_str.trim() === "end") {
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
        } else {
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
