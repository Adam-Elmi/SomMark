// @ts-check
import { TOKEN_TYPES, TOKEN_VALUES } from "./tokens.js";

const example = `[sometext = SomCheat Project Overview, 2025, 10, 3]
SomCheat->(b) is a platform for Somali developers->(b) to create, share, and learn from tech cheatsheets->(i) that improve coding skills and productivity->(b). This is its official website SomCheat.dev->(SomCheat.dev). We have developed useful features such as:

Cheatsheet Hub ->(h2)
Cheatsheet Hub is a collection of categorized cheatsheets for different programming languages and tools.

@_Table_@: Id, Language, Topics
- 101, JavaScript, Variables, Functions, Regex
- 202, Python, Loops, Data Structures, OOP
- 303, C, Memory Management, Pointers, File I/O

@_List_@: Supported Formats
- Markdown
- HTML
- JSON

[end]
[text = SomInfo Project Overview, 101]
SomInfo->(b) is a platform for Somali developers->(b) to create, share, and learn from tech cheatsheets->(i) that improve coding skills and productivity->(b). This is its official website SomCheat.dev->(SomCheat.dev). We have developed useful features such as:

Cheatsheet Hub ->(h2)
Cheatsheet Hub is a collection of categorized cheatsheets for different programming languages and tools.

@_Table_@: Id, Language, Topics
- 101, JavaScript, Variables, Functions, Regex
- 202, Python, Loops, Data Structures, OOP
- 303, C, Memory Management, Pointers, File I/O

@_List_@: Supported Formats
- Markdown
- HTML
- JSON
`;

function matchedValue(text, value) {
  if (text && value) {
    let matched = text.match(value);
    if (matched && matched.length > 0) {
      return matched[0];
    }
  }
}

/** @param {string} raw_text */
function lexer(raw_text) {
  if (raw_text) {
    const tokens = [];
    if (TOKEN_VALUES.END_BLOCK.test(raw_text)) {
      const content_blocks = raw_text.split(TOKEN_VALUES.END_BLOCK);
      for (const content of content_blocks) {
        if (TOKEN_VALUES.OPEN_BRACKET.test(content)) {
          tokens.push({
            type: TOKEN_TYPES.OPEN_BRACKET,
            value: matchedValue(content, TOKEN_VALUES.OPEN_BRACKET),
          });
        }
        if (TOKEN_VALUES.KEY.test(content)) {
          tokens.push({
            type: TOKEN_TYPES.KEY,
            value: matchedValue(content, TOKEN_VALUES.KEY),
          });
        }
        if (TOKEN_VALUES.EQUAL.test(content)) {
          tokens.push({
            type: TOKEN_TYPES.EQUAL,
            value: matchedValue(content, TOKEN_VALUES.EQUAL),
          });
        }
        if (TOKEN_VALUES.VALUE.test(content)) {
          tokens.push({
            type: TOKEN_TYPES.VALUE,
            value: matchedValue(content, TOKEN_VALUES.VALUE).split(","),
          });
        }
        if (TOKEN_VALUES.CLOSE_BRACKET.test(content)) {
          tokens.push({
            type: TOKEN_TYPES.CLOSE_BRACKET,
            value: matchedValue(content, TOKEN_VALUES.CLOSE_BRACKET),
          });
        }
        if (TOKEN_VALUES.TEXT_BLOCK.test(content)) {
          tokens.push({
            type: TOKEN_TYPES.TEXT_BLOCK,
            value: matchedValue(content, TOKEN_VALUES.TEXT_BLOCK),
          });
        }
      }
    } else {
      console.error("Token [end] | [END] is not found!");
    }
      console.log(tokens);
  }
}

lexer(example);
