import fs from "node:fs/promises";
import SomMark, { transpile } from "./index.js";

const file_content = await fs.readFile("./debug.smark", "utf-8");
let smark = new SomMark({
    src: "[CustomTag]\n[p]First[end][p]Second[end]\n[end]",
    format: "markdown",
});

const out = await smark.transpile();
console.log(out);