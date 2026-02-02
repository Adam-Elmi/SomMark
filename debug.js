import fs from "node:fs/promises";
import SomMark from "./index.js";

const buffer = await fs.readFile("./example.smark");
const file_content = buffer.toString();
let smark = new SomMark({ src: file_content, format: "html", includeDocument: true });

// console.log(JSON.stringify(smark.parse(), null, 2));
// console.log(smark.lex());
console.log(await smark.transpile());
