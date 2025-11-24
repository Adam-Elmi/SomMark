import TOKEN_TYPES from "./tokenTypes.js";
import peek from "../helpers/peek.js";
import isExpected from "../helpers/isExpected.js";
import {
  updateColumn,
  updateProps,
  updateStack,
} from "../helpers/updateData.js";
import addToken from "../helpers/addToken.js";
import { blockType1, blockType2, inlineType, atType1, atType2, endType1, endType2 } from "../helpers/t_types.js";
import skipSpaces from "../helpers/skipSpaces.js";
import concat from "../helpers/concat.js";

function lexer(src) {
  if (src && typeof src === "string") {
    const tokens = [];
    let scope_state = false;
    let line = 1, col = 1;
    let depth_stack = [], special_tokens = [], token_stack = [], _t = [];
    let context = "", temp_str = "", temp_value = "", previous_value = "";

    for (let i = 0; i < src.length; i++) {
      let current_char = src[i];
      // Token: Open Bracket
      if (current_char === "[" && scope_state === false) {
        if (peek(src, i, 1) + peek(src, i, 2) + peek(src, i, 3) !== "end") {
          depth_stack.push("Block");
        }
        const { start, end } = updateColumn(src, i, null, col);
        _t.push({type: "", value: "", line, start, end, depth: depth_stack.length });
        updateStack(token_stack, special_tokens, current_char, current_char);
        previous_value = current_char;
      }
      // Token: Equal Sign
      else if (current_char === "=" && scope_state === false) {
        const { start, end } = updateColumn(src, i, null, col);
        _t.push({type: "", value: "", line, start, end, depth: depth_stack.length });
        updateStack(token_stack, special_tokens, current_char, current_char);
        previous_value = current_char;
      }
      // Token: Close Bracket
      else if (current_char === "]" && scope_state === false) {
        const { start, end } = updateColumn(src, i, null, col);
        _t.push({type: "", value: "", line, start, end, depth: depth_stack.length });
        updateStack(token_stack, special_tokens, current_char, current_char);
        if (previous_value === "end") {
          depth_stack.pop();
        }
        
        if(previous_value !== "end" && peek(src, i, 1) !== "\n") {
          i++;
          temp_value = skipSpaces(src, i);
          i += temp_value.length - 1; 
        }
        
        if (peek(src, i, 1) !== "\n" && !token_stack.includes("end")) {
          addToken(tokens, {type: TOKEN_TYPES.TEXT, value: special_tokens.join(""), line, start, end, depth: depth_stack.length});
          token_stack = [];
          special_tokens = [];
          _t = [];
        } else if(peek(src, i, 1) === "\n") {
          const expected_tokens = [
             "[",
             "Block Identifier",
             "=",
             "Block Value",
             "]",
           ];
           const another_expected = ["[", "Block Identifier", "]"];
           // is block?
           if (
             isExpected(token_stack, expected_tokens) ||
             isExpected(token_stack, another_expected)
           ) {
             for (let t = 0; t < special_tokens.length; t++) {
               let token_props;
               if (special_tokens.length === expected_tokens.length) {
                   token_props = updateProps(token_props, _t, special_tokens, t, blockType1);
                   addToken(tokens, token_props);
               } else if(special_tokens.length === another_expected.length) {
                 token_props = updateProps(token_props, _t, special_tokens, t, blockType2);
                 addToken(tokens, token_props);
               }
             }
             token_stack = [];
             special_tokens = [];
             _t = [];
           }
        }
         
        if (previous_value === "end") {
          const endblock_tokens = ["[", "end", "]"];
          // is end block?
          if (isExpected(token_stack, endblock_tokens)) {
            for (let t = 0; t < special_tokens.length; t++) {
              let token_props;
              token_props = updateProps(token_props, _t, special_tokens, t, endType1);
              addToken(tokens, token_props);
            }
            token_stack = [];
            special_tokens = [];
            _t = [];
          }
        }
        previous_value = current_char;
      }
      // Token: Open Parenthesis
      else if (current_char === "(" && scope_state === false) {
        const { start, end } = updateColumn(src, i, null, col);
        _t.push({type: "", value: "", line, start, end, depth: depth_stack.length });
        updateStack(token_stack, special_tokens, current_char, current_char);
        if (previous_value !== "->" && scope_state === false) {
          previous_value = current_char;
        }
      }
      // Token: Thin Arrow
      else if (
        current_char === "-" &&
        peek(src, i, 1) === ">" &&
        scope_state === false
      ) {
        temp_value = current_char + peek(src, i, 1);
        const [next, column] = updateColumn(src, i, temp_value, col, false);
        i = next;
        const { start, end } = column;
        _t.push({type: "", value: "", line, start, end, depth: depth_stack.length });
        updateStack(token_stack, special_tokens, temp_value, temp_value);
        previous_value = temp_value;
      }
      // Token: Close Parenthesis
      else if (current_char === ")" && scope_state === false) {
        const { start, end } = updateColumn(src, i, null, col);
        _t.push({type: "", value: "", line, start, end, depth: depth_stack.length });
        updateStack(token_stack, special_tokens, current_char, current_char);
        if (
          token_stack.length === 3 &&
          peek(src, i, 1) !== "-" &&
          peek(src, i, 2) !== ">"
        ) {
          addToken(tokens, {type: TOKEN_TYPES.TEXT, value: special_tokens.join(""), line, start, end, depth: depth_stack.length});
          token_stack = [];
          special_tokens = [];
          _t = [];
        }
        const expected_tokens = [
          "(",
          "Inline Value",
          ")",
          "->",
          "(",
          "Inline Identifier",
          ")",
        ];
        // is inline?
          console.log(token_stack)
        if (isExpected(token_stack, expected_tokens)) {
          for (let t = 0; t < special_tokens.length; t++) {
            let token_props;
            token_props = updateProps(token_props, _t, special_tokens, t, inlineType);
            addToken(tokens, token_props);
          }
          token_stack = [];
          special_tokens = [];
          _t = [];
        }
        previous_value = current_char;
      }
      // Token: Open At (@_)
      else if (current_char === "@" && peek(src, i, 1) === "_") {
        temp_value = current_char + peek(src, i, 1);
        const [next, column] = updateColumn(src, i, temp_value, col, false);
        i = next;
        const { start, end } = column;
        _t.push({type: "", value: "", line, start, end, depth: depth_stack.length });
        updateStack(token_stack, special_tokens, temp_value, temp_value);
        previous_value = temp_value;
      }
      // Token: Close At (_@)
      else if (current_char === "_" && peek(src, i, 1) === "@") {
        temp_value = current_char + peek(src, i, 1);
        const [next, column] = updateColumn(src, i, temp_value, col, false);
        i = next;
        const { start, end } = column;
        _t.push({type: "", value: "", line, start, end, depth: depth_stack.length });
        updateStack(token_stack, special_tokens, temp_value, temp_value);
        if(previous_value !== "end" && peek(src, i, 1) !== "\n") {
          i++;
          temp_value = skipSpaces(src, i);
          i += temp_value.length - 1; 
        }
        if(peek(src, i, 1) !== "\n") {
          addToken(tokens, {type: TOKEN_TYPES.NEWLINE, value: special_tokens.join(""), line, start: col, end: col, depth: depth_stack.length});
        }
        if (peek(src, i, 1) === "\n" && previous_value !== "end") {
            const at_tokens = ["@_", "At Identifier", "_@"];
            // is at block?
            if (isExpected(token_stack, at_tokens)) {
              scope_state = true;
              for (let t = 0; t < special_tokens.length; t++) {
                let token_props;
                token_props = updateProps(token_props, _t, special_tokens, t, atType2);
                addToken(tokens, token_props);
              }
              token_stack = [];
              special_tokens = [];
              _t = [];
            }
        } else if (previous_value === "end") {
          const endblock_tokens = ["@_", "end", "_@"];
          // is end block?
          if (isExpected(token_stack, endblock_tokens)) {
            scope_state = false;
            for (let t = 0; t < special_tokens.length; t++) {
              let token_props;
              token_props = updateProps(token_props, _t, special_tokens, t, endType2);
              addToken(tokens, token_props);
            }
            token_stack = [];
            special_tokens = [];
            _t = [];
          }
        }
        previous_value = temp_value;
      }
      // Token: Colon
      else if (current_char === ":" && previous_value === "_@") {
        const { start, end } = updateColumn(src, i, null, col);
        _t.push({type: "", value: "", line, start, end, depth: depth_stack.length });
        updateStack(token_stack, special_tokens, current_char, current_char);
        previous_value = current_char;
      }
      // Token: Newline
      else if (current_char === "\n") {
        line++;
        col = 1;
        addToken(tokens, {type: TOKEN_TYPES.NEWLINE, value: current_char, line, start: col, end: col, depth: depth_stack.length});
      }
      // Token: Block Identifier OR Token: Value (Block Value) OR Token: End Keyword
      else {
        if (
          previous_value === "[" ||
          (previous_value === "=" && scope_state === false)
        ) {
          temp_str = concat(src, i, false, ["=", "]", "\n"], scope_state);
          const [next, column] = updateColumn(src, i, temp_str, col, false);
          i = next;
          const { start, end } = column;
          _t.push({type: "", value: "", line, start, end, depth: depth_stack.length });
          if (temp_str.trim()) {
            if (previous_value === "[") {
              // Token: End Keyword
              if (temp_str.trim() === "end") {
                updateStack(token_stack, special_tokens, temp_str, temp_str);
                previous_value = temp_str.trim();
                scope_state = false;
              }
              // Token: Block Identifier
              else {
                updateStack(
                  token_stack,
                  special_tokens,
                  "Block Identifier",
                  temp_str.trim(),
                );
                previous_value = "Block Identifier";
              }
            }
            // Token: Value (Block Value)
            else {
              updateStack(
                token_stack,
                special_tokens,
                "Block Value",
                temp_str.trim(),
              );
              previous_value = "Block Value";
            }
          }
        }
        // Token: Inline Value OR Token: Inline Identifier
        else if (
          previous_value === "(" ||
          (previous_value === "->" && scope_state === false)
        ) {
          temp_str = concat(src, i, false, [")"], scope_state);
          const [next, column] = updateColumn(src, i, temp_str, col, false);
          i = next;
          const { start, end } = column;
          _t.push({type: "", value: "", line, start, end, depth: depth_stack.length });
          if (temp_str.trim()) {
            if (previous_value === "(") {
              // Token: Inline Value
              updateStack(
                token_stack,
                special_tokens,
                "Inline Value",
                temp_str.trim(),
              );
              // Needs a fix??
              i -= temp_str.length
              token_stack = [];
              special_tokens = [];
              _t = [];
              console.log(temp_str);
              previous_value = "Inline Value";
            } else {
              // Token: Inline Identifier
              updateStack(
                token_stack,
                special_tokens,
                "Inline Identifier",
                temp_str.trim(),
              );
              previous_value = "Inline Identifier";
            }
          }
        }
        // Token: At Identifier OR Token: At Value OR Token: End Keyword
        else if (previous_value === "@_" || previous_value === ":") {
          temp_str = concat(src, i, false, ["_", "\n"], scope_state);
          if (temp_str.trim()) {
            const [next, column] = updateColumn(src, i, temp_str, col, false);
            i = next;
            const { start, end } = column;
            _t.push({type: "", value: "", line, start, end, depth: depth_stack.length });
            if (previous_value === "@_") {
              // Token: End Keyword
              if (temp_str.trim() === "end") {
                updateStack(
                  token_stack,
                  special_tokens,
                  temp_str.trim(),
                  temp_str.trim(),
                );
                previous_value = temp_str.trim();
                scope_state = false;
              }
              // Token: At Identifier
              else {
                updateStack(
                  token_stack,
                  special_tokens,
                  "At Identifier",
                  temp_str.trim(),
                );
                previous_value = "At Identifier";
              }
            }
            // Token: At Value
            else {
              updateStack(
                token_stack,
                special_tokens,
                "At Value",
                temp_str.trim(),
              );
              if(peek(src, i, 1) !== "\n") {
                addToken(tokens, {type: TOKEN_TYPES.NEWLINE, value: special_tokens.join(""), line, start: col, end: col, depth: depth_stack.length});
              }
              const expected_tokens = [
                "@_",
                "At Identifier",
                "_@",
                ":",
                "At Value",
              ];
              // is at block?
              if (isExpected(token_stack, expected_tokens)) {
                scope_state = true;
                for (let t = 0; t < special_tokens.length; t++) {
                  let token_props;
                  token_props = updateProps(token_props, _t, special_tokens, t, atType1);
                  addToken(tokens, token_props);
                }
                token_stack = [];
                special_tokens = [];
                _t = [];
              }
              previous_value = "At Value";
            }
          }
        }
        // Token: Comment
        else if (current_char === "#") {
          temp_str = concat(src, i, false, ["\n"], scope_state);
          if (temp_str) {
            const [next, column] = updateColumn(src, i, temp_str, col, false);
            i = next;
            const { start, end } = column;
            addToken(tokens, {type: TOKEN_TYPES.COMMENT, value: temp_str, line, start, end, depth: depth_stack.length});
          }
        }
        // Token: Text
        else {
          context = concat(src, i, true, null, scope_state);
          const [next, column] = updateColumn(src, i, context, col, false);
          i = next;
          const { start, end } = column;
          if (context.trim()) {
            addToken(tokens, {type: TOKEN_TYPES.TEXT, value: context, line, start, end, depth: depth_stack.length});
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
