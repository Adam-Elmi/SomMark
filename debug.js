import fs from "node:fs/promises";
import SomMark, { transpile } from "./index.js";

const src = await fs.readFile("./debug.smark", "utf-8");
let smark = new SomMark({
    src,
    format: "html",
});

const out = await smark.transpile();
console.log(out);