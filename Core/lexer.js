import fs from "node:fs/promises";
import TOKEN_TYPES from "./tokenTypes.js";

// Testing

const buffer = await fs.readFile("./Core/example.txt");
const file_content = buffer.toString();

function lexer(raw_source_code) {
  let state = "START";
  const tokens = [];
  if (raw_source_code && typeof raw_source_code === "string") {
    const lines = raw_source_code.split(/\n/);
    if (Array.isArray(lines) && lines.length > 0) {
      for (let i = 0; i < lines.length; i++) {
        switch (state) {
          case "START":
            if (/\s*\n*\[\s*/.test(lines[i])) {
              state = TOKEN_TYPES.OPEN_BRACKET;
              tokens.push({
                type: TOKEN_TYPES.OPEN_BRACKET,
                value: lines[i].match(/\s*\n*\[\s*/)[0],
                line: i + 1,
                column: /\s*\n*\[\s*/.exec(lines[i])
                  ? /\s*\n*\[\s*/.exec(lines[i]).index + 1
                  : "UNKNOWN",
              });
            }
            else if (/\s*[a-zA-Z0-9_]+\s*/.test(lines[i])) {
              state = TOKEN_TYPES.BLOCK_IDENTIFIER;
            } else if (/\s*\=+?\s*/.test(lines[i])) {
              state = TOKEN_TYPES.EQUAL;
            } else if (/([a-zA-Z0-9_\,\s])+/.test(lines[i])) {
              state = TOKEN_TYPES.VALUE;
            } else if (/\s*\]\s*\n?/.test(lines[i])) {
              state = TOKEN_TYPES.CLOSE_BRACKET;
            } else if (/([\s\S]*?)/.test(lines[i])) {
              state = TOKEN_TYPES.CONTENT;
            } else if (/\s*\[\s*end\s*\]\s*\n*/.test(lines[i])) {
              state = TOKEN_TYPES.BLOCK_END;
            } 
            else {
              console.error("UNEXPECTED CHARACTER");
            }
          case TOKEN_TYPES.OPEN_BRACKET:
            if(/\s*[a-zA-Z0-9_]+\s*(?= \s*\=+?\s*)/.test(lines[i])) {
              state = TOKEN_TYPES.BLOCK_IDENTIFIER;
              tokens.push({
                type: TOKEN_TYPES.BLOCK_IDENTIFIER,
                value: lines[i].match(/\s*[a-zA-Z0-9_]+\s*/)[0],
                line: i + 1,
                column: /\s*[a-zA-Z0-9_]+\s*/.exec(lines[i])
                  ? /\s*[a-zA-Z0-9_]+\s*/.exec(lines[i]).index + 1
                  : "UNKNOWN",
              });
            }
          case TOKEN_TYPES.BLOCK_IDENTIFIER:
            if (/\s*\=+?\s*/.test(lines[i])) {
              state = TOKEN_TYPES.EQUAL;
              tokens.push({
                type: TOKEN_TYPES.EQUAL,
                value: lines[i].match(/\s*\=+?\s*/)[0],
                line: i + 1,
                column: /\s*\=+?\s*/.exec(lines[i])
                  ? /\s*\=+?\s*/.exec(lines[i]).index + 1
                  : "UNKNOWN",
              });
            }
          case TOKEN_TYPES.EQUAL:
            if (/(?<=\=)\s*(.*?)\s*(?=\s*\]\s*\n*)/.test(lines[i])) {
              state = TOKEN_TYPES.VALUE;
              tokens.push({
                type: TOKEN_TYPES.VALUE,
                value: lines[i].match(/(?<=\=)\s*(.*?)\s*(?=\s*\]\s*\n*)/)[0],
                line: i + 1,
                column: /(?<=\=)\s*(.*?)\s*(?=\s*\]\s*\n*)/.exec(lines[i])
                  ? /(?<=\=)\s*(.*?)\s*(?=\s*\]\s*\n*)/.exec(lines[i]).index + 1
                  : "UNKNOWN",
              });
            }
          case TOKEN_TYPES.VALUE:
            if (/\s*\]\s*\n?/.test(lines[i])) {
              state = TOKEN_TYPES.CLOSE_BRACKET;
              tokens.push({
                type: TOKEN_TYPES.CLOSE_BRACKET,
                value: lines[i].match(/\s*\]\s*\n?/)[0],
                line: i + 1,
                column: /\s*\]\s*\n?/.exec(lines[i])
                  ? /\s*\]\s*\n?/.exec(lines[i]).index + 1
                  : "UNKNOWN",
              });
            }
          case TOKEN_TYPES.CLOSE_BRACKET:
            if (/(.)+?/.test(lines[i])) {
              state = TOKEN_TYPES.CONTENT;
              tokens.push({
                type: TOKEN_TYPES.CONTENT,
                value: lines[i].match(/(.)+/)[0],
                line: i + 1,
                column: /(.)+/.exec(lines[i])
                  ? /(.)+/.exec(lines[i]).index + 1
                  : "UNKNOWN",
              });
            }
          case TOKEN_TYPES.CONTENT:
            if (/\s*\[\s*end\s*\]\s*\n*/.test(lines[i])) {
              state = TOKEN_TYPES.BLOCK_END;
              tokens.push({
                type: TOKEN_TYPES.BLOCK_END,
                value: lines[i].match(/\s*\[\s*end\s*\]\s*\n*/)[0],
                line: i + 1,
                column: /\s*\[\s*end\s*\]\s*\n*/.exec(lines[i])
                  ? /\s*\[\s*end\s*\]\s*\n*/.exec(lines[i]).index + 1
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
