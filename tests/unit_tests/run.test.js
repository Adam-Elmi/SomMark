import fs from "node:fs/promises";
import path from "node:path";

const case_files = await fs.readdir(path.join(process.cwd(),"tests", "cases"));
console.log(case_files);
