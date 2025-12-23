import fs from "node:fs/promises";
import SomMark from "./core/sommark.js";
import markdown from "./mappers/default_mode/smark.md.js";
import html from "./mappers/default_mode/smark.html.js";

const buffer = await fs.readFile("./tests/examples/table.smark");
const file_content = buffer.toString();
let smark = new SomMark(file_content, "html", html);

// console.log(JSON.stringify(smark.parse(), null, 2));
// console.log(smark.lex());
console.log(smark.transpile());