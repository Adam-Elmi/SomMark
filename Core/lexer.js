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

function detector(input, index, expected_char = [], is_single_char = true) {
  let is_special_token = false;
  for (let ch = index; ch < input.length; ch++) {
    let char = input[ch];
    if (expected_char.includes(char)) {
      is_special_token = true;
      break;
    }
  }
  return is_special_token;
}

function advance(input, index, current_character) {
  let _is = false;
  switch (current_character) {
    case "[":
      _is = detector(
        input,
        index,
         ["=", "]"],
      );
      return _is;
    case "=":
      _is = detector(
        input,
        index,
        ["]"],
      );
      return _is;
    case "]":
      _is = detector(
        input,
        index,
         ["\n"],
      );
      return _is;
  }
}

function concat_char(input, index, advance, stop_at_char = []) {
  let str = "";
  for (let char_index = index; char_index < input.length; char_index++) {
    let char = input[char_index];
    if (typeof advance === "function") {
      if (advance(input, index, char)) {
        break;
      } else {
        str += char;
      }
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
      if (current_char === "[" && advance(src, i, current_char)) {
        add_token(TOKEN_TYPES.OPEN_BRACKET, current_char);
        BLOCK_STACK.push(current_char);
        prev_special_token = current_char;
      } else if (current_char === "=" && advance(src, i, current_char)) {
        BLOCK_STACK.push(current_char);
        add_token(TOKEN_TYPES.EQUAL, current_char);
      } else if (current_char === "]" && advance(src, i, current_char)) {
        add_token(TOKEN_TYPES.CLOSE_BRACKET, current_char);
      } else if (current_char === "\n") {
        add_token(TOKEN_TYPES.NEWLINE, current_char);
      } else {
        if (prev_special_token === "[") {
          temp_str = concat_char(src, i, null, ["=", "]"]);
          if (temp_str) {
            i += temp_str.length - 1;
          }
          add_token(TOKEN_TYPES.BLOCK_IDENTIFIER, temp_str);
        } else if (prev_special_token === "=") {
          temp_str = concat_char(src, i, null, ["]"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
          }
          add_token(TOKEN_TYPES.VALUE, temp_str);
        } else {
          context = concat_char(src, i, advance);
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
