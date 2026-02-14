import Transpiler from "../core/transpiler.js";
import Lexer from "../core/lexer.js";
import Parser from "../core/parser.js";
import JsonMapper from "../mappers/languages/json.js";

const smarkInput = `
[Json=object]

  [Object=user]
    (name)->(string: Adam)
    (age)->(number: 25)
    (isAdmin)->(bool: true)
    
    [Array=hobbies]
      (-)->(none: Coding, Reading)
      [Object]
        (name)->(string: Gaming)
        (type)->(string: Indoor)
      [end]
    [end]
    
    (meta)->(null)
  [end]
  
  (version)->(number: 2.0)
  (tags)->(array: v2, beta, stable)

[end]
`;

async function test() {
    const tokens = Lexer(smarkInput);
    const ast = Parser(tokens);
    const jsonOutput = await Transpiler({
        ast: ast,
        format: "json",
        mapperFile: JsonMapper
    });

    console.log("--- Raw Output ---");
    console.log(jsonOutput);

    try {
        const parsed = JSON.parse(jsonOutput);
        console.log("--- Valid JSON Parsed ---");
        console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
        console.error("--- Invalid JSON ---");
        console.error(e.message);
    }
}

test();
