
import lexer from '../SomMark-Vscode/src/sommark-lexer/core/lexer.js';

const code = `
[header
  title = "My Title"
]

Some text here.

-> inline_element(value)

# This is a comment

@_ list
  item 1;
  item 2;
_@
`;

try {
    console.log("Testing Lexer with sample code:");
    console.log(code);
    console.log("---------------------------------------------------");
    const tokens = lexer(code);
    console.log(JSON.stringify(tokens, null, 2));
} catch (e) {
    console.error(e);
}
