import fs from "node:fs/promises";
import TOKEN_TYPES from "./tokenTypes.js";

// Testing

const buffer = await fs.readFile("./Core/example.txt");
const file_content = buffer.toString();

function lexer(raw_source_code) {
  let state = "START";
  const tokens = [];
  let line = 1,
    column = 1;
  if (raw_source_code && typeof raw_source_code === "string") {
    const CONTENT_BLOCKS = raw_source_code.match(
      /\[\s*[a-zA-Z0-9_]+\s*=?\s*([a-zA-Z0-9_]*\s*\,?)+\s*\]\n([\s\S]*?)\n\[\s*end\s*\]\s*\n*/g,
    );
    if (Array.isArray(CONTENT_BLOCKS) && CONTENT_BLOCKS.length > 0) {
      for (const block of CONTENT_BLOCKS) {
        switch (state) {
          case "START":
            if (/\s*\[\s*/.test(block)) {
              state = TOKEN_TYPES.OPEN_BRACKET;
              tokens.push({
                type: TOKEN_TYPES.OPEN_BRACKET,
                value: block.match(/\s*\[/)[0],
                line: line,
                column: column,
              });
            } else {
              return false;
            }
          case TOKEN_TYPES.OPEN_BRACKET:
            if (/\s*[a-zA-Z0-9_]+\s*/.test(block)) {
              state = TOKEN_TYPES.BLOCK_IDENTIFIER;
              tokens.push({
                type: TOKEN_TYPES.BLOCK_IDENTIFIER,
                value: block.match(/[a-zA-Z0-9_]+/)[0],
                line: line,
                column: column,
              });
            } else {
              return false;
            }
          case TOKEN_TYPES.BLOCK_IDENTIFIER:
            if (/\s*\=\s*/.test(block)) {
              state = TOKEN_TYPES.EQUAL;
              tokens.push({
                type: TOKEN_TYPES.EQUAL,
                value: block.match(/\s*\=\s*/)[0],
                line: line,
                column: column,
              });
            } else {
              return false;
            }
          case TOKEN_TYPES.EQUAL:
            if (/\s*([a-zA-Z0-9_]*\s*\,?)+\s*(?=\]\s*\n)/.test(block)) {
              state = TOKEN_TYPES.VALUE;
              const values = block
                .match(/\s*([a-zA-Z0-9_]*\s*\,?)+\s*(?=\]\s*\n)/)[0]
                .split(",");
              if (
                Array.isArray(values) &&
                values.length > 0 &&
                values.length > 1
              ) {
                for (const value of values) {
                  tokens.push({
                    type: TOKEN_TYPES.VALUE,
                    value: value,
                    line: line,
                    column: column,
                  });
                }
              } else {
                tokens.push({
                  type: TOKEN_TYPES.VALUE,
                  value: block.match(
                    /\s*([a-zA-Z0-9_]*\s*\,?)+\s*(?=\]\s*\n)/,
                  )[0],
                  line: line,
                  column: column,
                });
              }
            } else {
              return false;
            }
          case TOKEN_TYPES.VALUE:
            if (/\s*\]\s*\n/s.test(block)) {
              state = TOKEN_TYPES.CLOSE_BRACKET;
              tokens.push({
                type: TOKEN_TYPES.CLOSE_BRACKET,
                value: block.match(/\s*\]\s*\n/)[0],
                line: line,
                column: column,
              });
            } else {
              return false;
            }
          case TOKEN_TYPES.CLOSE_BRACKET:
            if (/(?<=\]\n+)([\s\S]*?)(?=\n+\[\s*end\s*\])/s.test(block)) {
              state = TOKEN_TYPES.CONTENT;
              const text_block = block.match(
                /(?<=\]\n+)([\s\S]*?)(?=\n+\[\s*end\s*\])/,
              )[0];
              const inline_statements = text_block.match(
                /[\S]+[^\)]->\([\S]+\)\s*\n?\.?/g,
              );
              const inline_statement_with_paren = text_block.match(
                /\([^)]+\)\s*->\s*\([\S\s]+\)/g,
              );
              console.log(inline_statements);
              console.log(inline_statement_with_paren);
              tokens.push({
                type: TOKEN_TYPES.CONTENT,
                value: block.match(
                  /(?<=\]\n+)([\s\S]*?)(?=\n+\[\s*end\s*\])/,
                )[0],
                line: line,
                column: column,
              });
            } else {
              return false;
            }
          case TOKEN_TYPES.CONTENT:
            if (/\s*\[\s*end\s*\]\s*\n*/.test(block)) {
              state = TOKEN_TYPES.BLOCK_END;
              tokens.push({
                type: TOKEN_TYPES.BLOCK_END,
                value: block.match(/\s*\[\s*end\s*\]\s*\n*/)[0],
                line: line,
                column: column,
              });
            } else {
              return false;
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
