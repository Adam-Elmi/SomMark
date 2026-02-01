import fs from "node:fs/promises";
import SomMark from "../../index.js";

const filePath = process.argv[2];
if (!filePath) {
    console.error("Please provide a file path.");
    process.exit(1);
}

let file_content;
try {
    const buffer = await fs.readFile(filePath);
    file_content = buffer.toString();
} catch (e) {
    console.error(`Could not read file: ${filePath}`);
    process.exit(1);
}

// Default HTML mapper
let smark = new SomMark({ src: file_content, format: "html", includeDocument: false });

try {
    const output = await smark.transpile();
    console.log(output);
} catch (error) {
    console.error("Transpilation failed:", error.message || error);
}
