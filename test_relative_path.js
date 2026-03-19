import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const smarkDir = "/home/adam/Projects/Smark/SomMark";
const testDir = "/home/adam/test_import_subdir";

if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);

const mainRelative = "main.smark";
const importedRelative = "imported.smark";

const mainFile = path.join(testDir, mainRelative);
const importedFile = path.join(testDir, importedRelative);

fs.writeFileSync(importedFile, "SUBDIR IMPORT CONTENT");
fs.writeFileSync(mainFile, `[import = sub: "${importedRelative}" ][end]\n[$use-module = sub][end]`);

console.log("Running CLI from TEST DIR with RELATIVE path");
try {
    const out = execSync(`node ${path.join(smarkDir, "cli/cli.mjs")} --html -p ${mainRelative}`, { 
        cwd: testDir,
        encoding: "utf-8" 
    });
    console.log("CLI Output (last 100 chars):");
    console.log(out.slice(-200));
    if (out.includes("SUBDIR IMPORT CONTENT")) {
        console.log("SUCCESS: Imported content found!");
    } else {
        console.log("FAILURE: Imported content NOT found!");
    }
} catch (e) {
    console.error("CLI Execution failed:");
    console.error(e.stdout || e.stderr || e.message);
}
