import Transpiler from "../core/transpiler.js";
import Lexer from "../core/lexer.js";
import Parser from "../core/parser.js";
import JsonMapper from "../mappers/languages/json.js";

const invalidSmark = `
[Json=object]
  (noKey)->(none: 1)
[end]
`;

const validSmark = `
[Json=object]
  (validKey)->(number: 1)
[end]
`;

async function testErrors() {
    console.log("--- Testing Invalid Input ---");
    try {
        const tokens = Lexer(invalidSmark);
        const ast = Parser(tokens);
        await Transpiler({
            ast: ast,
            format: "json",
            mapperFile: JsonMapper
        });
        console.error("Test Failed: Should have thrown error");
    } catch (e) {
        console.log("Caught expected error:");
        console.log(e);
    }

    console.log("\n--- Testing Valid Input ---");
    try {
        const tokens2 = Lexer(validSmark);
        const ast2 = Parser(tokens2);
        await Transpiler({
            ast: ast2,
            format: "json",
            mapperFile: JsonMapper
        });
        console.log("Valid input passed.");
    } catch (e) {
        console.error("Valid input failed:", e);
    }
}

testErrors();
