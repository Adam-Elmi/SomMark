import fs from "node:fs/promises";
import SomMark from "./core/sommark.js";
import markdown from "./mapping/default_mode/smark.md.js";
import html from "./mapping/default_mode/smark.html.js";

const buffer = await fs.readFile("./tests/examples/basic.smark");
const file_content = buffer.toString();
let smark = new SomMark(file_content, "md", markdown);

// console.log(JSON.stringify(smark.parse(), null, 2));
// console.log(smark.lex());
console.log(smark.transpile());