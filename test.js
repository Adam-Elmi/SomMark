import fs from "node:fs/promises";
import SomMark from "./Core/sommark.js";

const buffer = await fs.readFile("./tests/examples/simple.smark");
const file_content = buffer.toString();
let smark = new SomMark(file_content);

console.log(smark.lex());
// smark.parse()