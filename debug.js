import fs from "node:fs/promises";
import SomMark from "./index.js";

const buffer = await fs.readFile("./examples/markdown/tasks.smark");
const file_content = buffer.toString();
let smark = new SomMark({ 
    src: file_content, 
    format: "markdown", 
    includeDocument: true,
});


// console.log(JSON.stringify(await smark.parse(), null, 2));
// console.log(await smark.lex());
console.log(await smark.transpile());
