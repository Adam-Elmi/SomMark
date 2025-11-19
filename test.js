import fs from "node:fs/promises";
import SomMark from "./js/core/sommark.js";

const buffer = await fs.readFile("./tests/examples/basic.smark");
const file_content = buffer.toString();
let smark = new SomMark(file_content);

console.log(JSON.stringify(smark.parse(), null, 2));