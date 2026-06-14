import fs from "node:fs/promises";
import SomMark, { transpile } from "./index.js";

const file_content = await fs.readFile("./debug.smark", "utf-8");
let smark = new SomMark({
    src: file_content,
    format: "html",
});

const out = await smark.transpile();
console.log(out);