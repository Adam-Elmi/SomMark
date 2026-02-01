import fs from "node:fs/promises";
import SomMark from "../../index.js";

const filePath = process.argv[2] || "./tests/lexer/basic_tokens.smark";
let file_content;

try {
    const buffer = await fs.readFile(filePath);
    file_content = buffer.toString();
} catch (e) {
    if (process.argv[2]) {
        console.error(`Could not read file: ${filePath}`);
        process.exit(1);
    }
    // Fallback
    file_content = "[Block]Content[end]";
}

let smark = new SomMark({ src: file_content, format: "markdown", includeDocument: true });

try {
    const tokens = smark.lex();
    console.log(JSON.stringify(tokens, null, 2));
} catch (error) {
    console.error("Lexing failed:", error);
}
