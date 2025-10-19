import fs from "node:fs/promises";
import TOKEN_TYPES from "./tokenTypes.js";

// Testing

const buffer = await fs.readFile("./Core/example.smark");
const file_content = buffer.toString();

function lexer(raw_source_code) {
  let state = "START";
  const tokens = [];
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
              tokens.push({
                type: TOKEN_TYPES.OPEN_BRACKET,
                value: lines[i].match(open_bracket_pattern)[0],
                line: i + 1,
                column: open_bracket_pattern.exec(lines[i])
                  ? open_bracket_pattern.exec(lines[i]).index + 1
                  : "UNKNOWN",
              });
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
              tokens.push({
                type: TOKEN_TYPES.BLOCK_IDENTIFIER,
                value: lines[i].match(block_identifier_pattern)[0],
                line: i + 1,
                column: block_identifier_pattern.exec(lines[i])
                  ? block_identifier_pattern.exec(lines[i]).index + 1
                  : "UNKNOWN",
              });
            }
          case TOKEN_TYPES.BLOCK_IDENTIFIER:
            if (equal_sign_pattern.test(lines[i])) {
              state = TOKEN_TYPES.EQUAL;
              tokens.push({
                type: TOKEN_TYPES.EQUAL,
                value: lines[i].match(equal_sign_pattern)[0],
                line: i + 1,
                column: equal_sign_pattern.exec(lines[i])
                ? equal_sign_pattern.exec(lines[i]).index + 1
                  : "UNKNOWN",
              });
            }
          case TOKEN_TYPES.EQUAL:
            if (value_pattern.test(lines[i])) {
              state = TOKEN_TYPES.VALUE;
              tokens.push({
                type: TOKEN_TYPES.VALUE,
                value: lines[i].match(value_pattern)[0],
                line: i + 1,
                column: value_pattern.exec(lines[i])
                  ? value_pattern.exec(lines[i]).index + 1
                  : "UNKNOWN",
              });
            }
          case TOKEN_TYPES.VALUE:
            if (close_bracket_pattern.test(lines[i])) {
              state = TOKEN_TYPES.CLOSE_BRACKET;
              tokens.push({
                type: TOKEN_TYPES.CLOSE_BRACKET,
                value: lines[i].match(close_bracket_pattern)[0],
                line: i + 1,
                column: close_bracket_pattern.exec(lines[i])
                  ? close_bracket_pattern.exec(lines[i]).index + 1
                  : "UNKNOWN",
              });
            }
          case TOKEN_TYPES.CLOSE_BRACKET:
            if (
              !/\s*\[\s*(.)+\=+?\s*(.)+\s*\]\s*\n*?/.test(lines[i]) &&
              !/\s*\[\s*end\s*\]\s*\n*?/.test(lines[i])
            ) {
              if (content_pattern.test(lines[i])) {
                state = TOKEN_TYPES.CONTENT;
                tokens.push({
                  type: TOKEN_TYPES.CONTENT,
                  value: lines[i].match(content_pattern)[0],
                  line: i + 1,
                  column: content_pattern.exec(lines[i])
                    ? content_pattern.exec(lines[i]).index + 1
                    : "UNKNOWN",
                });
              }
            }
          case TOKEN_TYPES.CONTENT:
            if (end_keyword_pattern.test(lines[i])) {
              state = TOKEN_TYPES.END_KEYWORD;
              tokens.push({
                type: TOKEN_TYPES.END_KEYWORD,
                value: lines[i].match(end_keyword_pattern)[0],
                line: i + 1,
                column: end_keyword_pattern.exec(lines[i])
                  ? end_keyword_pattern.exec(lines[i]).index + 1
                  : "UNKNOWN",
              });
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
