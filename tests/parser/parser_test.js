import fs from "node:fs/promises";
import SomMark from "../../index.js";

const filePath = process.argv[2] || "./tests/parser/syntax_test.smark";
const buffer = await fs.readFile(filePath);
const file_content = buffer.toString();
let smark = new SomMark({ src: file_content, format: "markdown", includeDocument: true });

try {
    const ast = smark.parse();
    console.log(JSON.stringify(ast, null, 2));
} catch (error) {
    console.error("Parsing failed:", error);
}
