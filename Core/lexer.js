import TOKEN_TYPES from "./tokenTypes.js";

function lexer(src) {
  if (src && typeof src === "string") {
    let previous_value = "";
    let DEPTH_STACK = [];

    function peek(input, index, offset) {
      if (index + offset < input.length) {
        if (input[index + offset] !== undefined) {
          return input[index + offset];
        }
      }
      return null;
    }

    function concat_char(input, index, mode = "normal", stop_at_char = []) {
      let str = "";
      for (let char_index = index; char_index < input.length; char_index++) {
        let char = input[char_index];
        if (mode === "normal") {
          if (char === "\n") {
            break;
          }
          /* Escape characters */
          // '[
          else if (char === "[" && peek(input, char_index, -1) !== "\'") {
            break;
          }
          // ]'
          else if (char === "]" && peek(input, char_index, 1) !== "\'") {
            break;
          }
          // '(
          else if (char === "(" && peek(input, char_index, -1) !== "\'") {
            break;
          }
          // )'
          else if (char === ")" && peek(input, char_index, 1) !== "\'") {
            break;
          }
          // '@_
          else if (
            char === "@" &&
            peek(input, char_index, 1) === "_" &&
            peek(input, char_index, -1) !== "\'"
          ) {
            break;
          }
          // _@'
          else if (
            char === "_" &&
            peek(input, char_index, 1) === "@" &&
            peek(input, char_index, 2) !== "\'"
          ) {
            break;
          }
          // '#
          else if (char === "#" && peek(input, char_index, -1) !== "\'") {
            break;
          }
          str += char;
        } else if (mode === "active") {
          if (stop_at_char.includes(char)) {
            break;
          }
          str += char;
        }
      }

      return str;
    }
    const tokens = [];
    let line = 1;
    let column_start = 1,
      column_end = 1;
    let context = "";
    let temp_str = "";
    let temp_value = "";

    function add_token(type, value, depth = DEPTH_STACK.length) {
      tokens.push({ type, value, line, column_start, column_end, depth });
    }

    for (let i = 0; i < src.length; i++) {
      let current_char = src[i];
      // Token: Open Bracket
      if (current_char === "[") {
        column_start = i + 1;
        column_end = column_start;
        if (peek(src, i, 1) + peek(src, i, 2) + peek(src, i, 3) !== "end") {
          DEPTH_STACK.push("Block");
        }
        add_token(TOKEN_TYPES.OPEN_BRACKET, current_char);
        previous_value = current_char;
      }
      // Token: Equal Sign
      else if (current_char === "=") {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.EQUAL, current_char);
        previous_value = current_char;
      }
      // Token: Close Bracket
      else if (current_char === "]") {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.CLOSE_BRACKET, current_char);
        if (previous_value === "end") {
          DEPTH_STACK.pop();
        }
        previous_value = current_char;
      }
      // Token: Open Parenthesis
      else if (current_char === "(") {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.OPEN_PAREN, current_char);
        if (previous_value !== "->") {
          previous_value = current_char;
        }
      }
      // Token: Thin Arrow
      else if (current_char === "-" && peek(src, i, 1) === ">") {
        column_start = i + 1;
        temp_value = current_char + peek(src, i, 1);
        add_token(TOKEN_TYPES.THIN_ARROW, temp_value);
        i += temp_value.length - 1;
        current_char = src[i];
        column_end = i + 1;
        previous_value = temp_value;
      }
      // Token: Close Parenthesis
      else if (current_char === ")") {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.CLOSE_PAREN, current_char);
        previous_value = current_char;
      }
      // Token: Open At (@_)
      else if (current_char === "@" && peek(src, i, 1) === "_") {
        column_start = i + 1;
        temp_value = current_char + peek(src, i, 1);
        add_token(TOKEN_TYPES.OPEN_AT, temp_value);
        i += temp_value.length - 1;
        current_char = src[i];
        column_end = i + 1;
        previous_value = temp_value;
      }
      // Token: Close At (_@)
      else if (current_char === "_" && peek(src, i, 1) === "@") {
        column_start = i + 1;
        temp_value = current_char + peek(src, i, 1);
        add_token(TOKEN_TYPES.CLOSE_AT, temp_value);
        i += temp_value.length - 1;
        current_char = src[i];
        column_end = i + 1;
        previous_value = temp_value;
      }
      // Token: Colon
      else if (current_char === ":" && previous_value === "_@") {
        column_start = i + 1;
        column_end = column_start;
        add_token(TOKEN_TYPES.COLON, current_char);
        previous_value = current_char;
      }
      // Token: End Keyword
      else if (
        current_char === "e" &&
        peek(src, i, 1) === "n" &&
        peek(src, i, 2) === "d" &&
        (previous_value === "[" || previous_value === "@_")
      ) {
        column_start = i + 1;
        temp_value = current_char + peek(src, i, 1) + peek(src, i, 2);
        add_token(TOKEN_TYPES.END_KEYWORD, temp_value);
        i += temp_value.length - 1;
        current_char = src[i];
        column_end = i + 1;
        previous_value = temp_value;
      }
      // Token: Newline (\n)
      else if (current_char === "\n") {
        line += 1;
        column_start = 1;
        column_end = 1;
        add_token(TOKEN_TYPES.NEWLINE, current_char);
      } else {
        // Token: Block Identifier OR Token: Value (Block Value)
        if (previous_value === "[" || previous_value === "=") {
          column_start = i + 1;
          temp_str = concat_char(src, i, "active", ["=", "]"]);
          if (temp_str.trim()) {
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
            if (previous_value === "[") {
              add_token(TOKEN_TYPES.IDENTIFIER, temp_str);
              previous_value = "Block Identifier";
            } else {
              add_token(TOKEN_TYPES.VALUE, temp_str);
              previous_value = "Block Value";
            }
          }
        }
        // Token: Value (Inline Value) OR Token: Inline Identifier
        else if (previous_value === "(" || previous_value === "->") {
          column_start = i + 1;
          temp_str = concat_char(src, i, "active", [")"]);
          if (temp_str.trim()) {
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
            if (previous_value === "(") {
              add_token(TOKEN_TYPES.VALUE, temp_str);
              previous_value = "Inline Value";
            } else {
              add_token(TOKEN_TYPES.IDENTIFIER, temp_str);
              previous_value = "Inline Identifier";
            }
          }
        }
        // Token: At Identifier OR Token: Value (At Value)
        else if (previous_value === "@_" || previous_value === ":") {
          column_start = i + 1;
          temp_str = concat_char(src, i, "active", ["_", "\n"]);
          if (temp_str.trim()) {
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
            if (previous_value === "@_") {
              add_token(TOKEN_TYPES.IDENTIFIER, temp_str);
              previous_value = "At Identifier";
            } else {
              add_token(TOKEN_TYPES.VALUE, temp_str);
              previous_value = "At Value";
            }
          }
        }
        // Token: Comment
        else if (current_char === "#") {
          temp_str = concat_char(src, i, "active", ["\n"]);
          if (temp_str) {
            i += temp_str.length - 1;
            current_char = src[i];
            column_end = i + 1;
            add_token(TOKEN_TYPES.COMMENT, temp_str);
          }
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
      temp_value = "";
    }
    return tokens;
  } else {
    throw new Error("Invalid Source Code");
  }
}

export default lexer;
