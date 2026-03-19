import parser from './core/parser.js';
import lexer from './core/lexer.js';

const input = `
@_Table_@: key, val;
This is some text.
@_Table_@

Some more text.

(inline) -> (id)
`;

console.log("Starting top-level reproduction...");
try {
    const tokens = lexer(input, "test.smark");
    console.log("Tokens count:", tokens.length);
    const ast = parser(tokens, "test.smark");
    console.log("AST Parsed Successfully. Node types found at top level:");
    ast.forEach(node => {
        console.log("- Type: " + node.type + (node.id ? " (id: " + node.id + ")" : ""));
    });
} catch (e) {
    console.error("Error during parsing:");
    console.error(e);
}
