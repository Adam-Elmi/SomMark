import fs from "node:fs/promises";
import TOKEN_TYPES from "./tokenTypes.js";

// Testing

const buffer = await fs.readFile("./Core/example.smark");
const file_content = buffer.toString();

function lexer(raw_source_code) {
  let state = "START";
  const tokens = [];
  const stack_1 = [],
    stack_2 = [];
  const add_token = (type, lines, index, pattern) => {
    if (type && Array.isArray(lines) && lines.length > 0 && pattern) {
      const match = pattern.exec(lines[index]);
      if (match) {
        tokens.push({
          type,
          value: match[0],
          line: index + 1,
          column: match.index + 1,
        });
      }
    } else {
      throw new Error(
        "ENSURE THAT ALL ARGUMENTS ARE DEFINED AND THEIR REAL VALUES ARE NOT EQUAL TO NULL OR UNDEFINED.",
      );
    }
  };
  const open_bracket_pattern =
    /\s*\[\s*(?=(.)+\s*\=+?\s*(.)+\s*\]\s*\n*?|end\s*\])/;
  const block_identifier_pattern = /\s*[a-zA-Z0-9_]+\s*(?= \s*\=+?\s*)/;
  const equal_sign_pattern = /\s*\=+?\s*/;
  const value_pattern = /(?<=\=)\s*(.*?)\s*(?=\s*\]\s*\n*)/;
  const close_bracket_pattern =
    /(?<=\s*\[\s*(.)+\s*\=+?\s*(.)+|\[\s*end)\s*\]\s*\n?/;
  const content_pattern = /[\s\S]+[^@_end_@]+/;
  const open_at_pattern = /\s*@_(?=\s*(.)+_@)/;
  const at_identifier_pattern = /(?<=\s*@_)\s*[a-zA-Z0-9_]+[^end]+\s*(?=_@)/;
  const close_at_pattern = /(?<=\s*@_(.)+)\s*_@\s*\:?\s*/;
  const end_keyword_pattern = /(?<=(\[|@_))\s*end\s*(?=(\]|_@))/;

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
            } else if (open_at_pattern.test(lines[i])) {
              state = TOKEN_TYPES.OPEN_AT;
            } else if (at_identifier_pattern.test(lines[i])) {
              state = TOKEN_TYPES.AT_IDENTIFIER;
            } else if (close_at_pattern.test(lines[i])) {
              state = TOKEN_TYPES.CLOSE_AT;
            } else if (end_keyword_pattern.test(lines[i])) {
              state = TOKEN_TYPES.END_KEYWORD;
            } else if (block_identifier_pattern.test(lines[i])) {
            } else {
              console.error(`UNEXPECTED CHARACTER AT LINE ${lines[i]}`);
            }
          case TOKEN_TYPES.OPEN_BRACKET:
            if (block_identifier_pattern.test(lines[i])) {
              state = TOKEN_TYPES.BLOCK_IDENTIFIER;
              stack_1.push(TOKEN_TYPES.OPEN_BRACKET);
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
              if (end_keyword_pattern.test(lines[i])) {
                if (stack_1.length > 0) {
                  stack_1.pop();
                  add_token(
                    TOKEN_TYPES.END_KEYWORD,
                    lines,
                    i,
                    end_keyword_pattern,
                  );
                }
              }
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
            if (open_at_pattern.test(lines[i])) {
              state = TOKEN_TYPES.OPEN_AT;
              stack_2.push(TOKEN_TYPES.OPEN_AT);
              add_token(TOKEN_TYPES.OPEN_AT, lines, i, open_at_pattern);
            }

          case TOKEN_TYPES.OPEN_AT:
            if (at_identifier_pattern.test(lines[i])) {
              state = TOKEN_TYPES.AT_IDENTIFIER;
              add_token(
                TOKEN_TYPES.AT_IDENTIFIER,
                lines,
                i,
                at_identifier_pattern,
              );
            }

          case TOKEN_TYPES.AT_IDENTIFIER:
            if (close_at_pattern.test(lines[i])) {
              state = TOKEN_TYPES.CLOSE_AT;
              if (end_keyword_pattern.test(lines[i])) {
                if (stack_2.length > 0) {
                  stack_2.pop();
                  add_token(
                    TOKEN_TYPES.END_KEYWORD,
                    lines,
                    i,
                    end_keyword_pattern,
                  );
                }
              }
              add_token(TOKEN_TYPES.CLOSE_AT, lines, i, close_at_pattern);
            }

          case TOKEN_TYPES.CLOSE_AT:
            if (end_keyword_pattern.test(lines[i])) {
              state = TOKEN_TYPES.END_KEYWORD;
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
