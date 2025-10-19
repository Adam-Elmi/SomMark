import fs from "node:fs/promises";
import TOKEN_TYPES from "./tokenTypes.js";

// Testing

const buffer = await fs.readFile("./Core/example.smark");
const file_content = buffer.toString();

function lexer(raw_source_code) {
  let state = "START";
  const tokens = [];
  const add_token = (type, lines, index, pattern) => {
    if (type, lines, index, pattern) {
      tokens.push({
        type,
        value: lines[index].match(pattern)[0],
        line: index + 1,
        column: pattern.exec(lines[index])
          ? pattern.exec(lines[index]).index + 1
          : "UNKNOWN",
      });
    } else {
      throw new Error(
        "ENSURE THAT ALL ARGUMENTS ARE DEFINED AND THEIR REAL VALUES ARE NOT EQUAL TO NULL OR UNDEFINED.",
      );
    }
  };
  const open_bracket_pattern = /\s*\[\s*(?=(.)+\s*\=+?\s*(.)+\s*\]\s*\n*?)/;
  const block_identifier_pattern = /\s*[a-zA-Z0-9_]+\s*(?= \s*\=+?\s*)/;
  const equal_sign_pattern = /\s*\=+?\s*/;
  const value_pattern = /(?<=\=)\s*(.*?)\s*(?=\s*\]\s*\n*)/;
  const close_bracket_pattern = /(?<=\s*\[\s*(.)+\s*\=+?\s*(.)+)\s*\]\s*\n?/;
  const content_pattern = /[\s\S]+/;
  const end_keyword_pattern = /(?<=\s*\[)\s*end\s*(?=\]\s*\n*?)/;
  if (raw_source_code && typeof raw_source_code === "string") {
    const lines = raw_source_code.split(/\n/);
    if (Array.isArray(lines) && lines.length > 0) {
      for (let i = 0; i < lines.length; i++) {
        switch (state) {
          case "START":
            if (open_bracket_pattern.test(lines[i])) {
              state = TOKEN_TYPES.OPEN_BRACKET;
              add_token(
                TOKEN_TYPES.OPEN_BRACKET,
                lines,
                i,
                open_bracket_pattern,
              );
            } else if (block_identifier_pattern.test(lines[i])) {
              state = TOKEN_TYPES.BLOCK_IDENTIFIER;
            } else if (equal_sign_pattern.test(lines[i])) {
              state = TOKEN_TYPES.EQUAL;
            } else if (value_pattern.test(lines[i])) {
              state = TOKEN_TYPES.VALUE;
            } else if (close_bracket_pattern.test(lines[i])) {
              state = TOKEN_TYPES.CLOSE_BRACKET;
            } else if (
              !/\s*\[\s*(.)+\=+?\s*(.)+\s*\]\s*\n*?/.test(lines[i]) &&
              !/\s*\[\s*end\s*\]\s*\n*?/.test(lines[i])
            ) {
              if (content_pattern.test(lines[i])) {
                state = TOKEN_TYPES.CONTENT;
              }
            } else if (end_keyword_pattern.test(lines[i])) {
              state = TOKEN_TYPES.END_KEYWORD;
            } else {
              console.error("UNEXPECTED CHARACTER");
            }
          case TOKEN_TYPES.OPEN_BRACKET:
            if (block_identifier_pattern.test(lines[i])) {
              state = TOKEN_TYPES.BLOCK_IDENTIFIER;
              add_token(
                TOKEN_TYPES.BLOCK_IDENTIFIER,
                lines,
                i,
                block_identifier_pattern,
              );
            }
          case TOKEN_TYPES.BLOCK_IDENTIFIER:
            if (equal_sign_pattern.test(lines[i])) {
              state = TOKEN_TYPES.EQUAL;
              add_token(TOKEN_TYPES.EQUAL, lines, i, equal_sign_pattern);
            }
          case TOKEN_TYPES.EQUAL:
            if (value_pattern.test(lines[i])) {
              state = TOKEN_TYPES.VALUE;
              add_token(TOKEN_TYPES.VALUE, lines, i, value_pattern);
            }
          case TOKEN_TYPES.VALUE:
            if (close_bracket_pattern.test(lines[i])) {
              state = TOKEN_TYPES.CLOSE_BRACKET;
              add_token(
                TOKEN_TYPES.CLOSE_BRACKET,
                lines,
                i,
                close_bracket_pattern,
              );
            }
          case TOKEN_TYPES.CLOSE_BRACKET:
            if (
              !/\s*\[\s*(.)+\=+?\s*(.)+\s*\]\s*\n*?/.test(lines[i]) &&
              !/\s*\[\s*end\s*\]\s*\n*?/.test(lines[i])
            ) {
              if (content_pattern.test(lines[i])) {
                state = TOKEN_TYPES.CONTENT;
                add_token(TOKEN_TYPES.CONTENT, lines, i, content_pattern);
              }
            }
          case TOKEN_TYPES.CONTENT:
            if (end_keyword_pattern.test(lines[i])) {
              state = TOKEN_TYPES.END_KEYWORD;
              add_token(TOKEN_TYPES.END_KEYWORD, lines, i, end_keyword_pattern);
            }
        }
        state = "START";
      }
    }
  } else {
    throw new Error("RAW SOURCE CODE MUST BE A STRING AND NOT EMPTY!");
  }
  return tokens;
}

console.log(lexer(file_content));