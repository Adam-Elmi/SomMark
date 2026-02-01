import fs from "node:fs/promises";
import SomMark from "./index.js";
import custom_html from "./custom.smark.js";

const buffer = await fs.readFile("./example.smark");
const file_content = buffer.toString();
let smark = new SomMark({ src: file_content, format: "html", includeDocument: false });

// console.log(JSON.stringify(smark.parse(), null, 2));
// console.log(smark.lex());
console.log(await smark.transpile());
