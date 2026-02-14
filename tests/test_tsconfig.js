import Transpiler from "../core/transpiler.js";
import Lexer from "../core/lexer.js";
import Parser from "../core/parser.js";
import JsonMapper from "../mappers/languages/json.js";
import { readFileSync, writeFile } from "fs";

const inputFile = "examples/tsconfig.smark";
const outputFile = "examples/repro_tsconfig.json";

async function run() {
    try {
        const source = readFileSync(inputFile, "utf-8");
        const tokens = Lexer(source);
        const ast = Parser(tokens);
        const jsonOutput = await Transpiler({
            ast: ast,
            format: "json",
            mapperFile: JsonMapper
        });

        // Validate JSON
        const parsed = JSON.parse(jsonOutput);
        console.log("Valid JSON generated!");
        // console.log(JSON.stringify(parsed, null, 2));

        writeFile(outputFile, JSON.stringify(parsed, null, 2), (err) => {
            if (err) console.error(err);
            else console.log(`Written to ${outputFile}`);
        });

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
