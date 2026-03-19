import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const smarkDir = "/home/adam/Projects/Smark/SomMark";
const testRootDir = "/home/adam/sommark_test_env";

// Setup test environment
if (fs.existsSync(testRootDir)) fs.rmSync(testRootDir, { recursive: true, force: true });
fs.mkdirSync(testRootDir);

function createTestFile(relPath, content) {
    const absPath = path.join(testRootDir, relPath);
    const dir = path.dirname(absPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(absPath, content);
    return absPath;
}

// 1. Same directory import
createTestFile("dir1/imported.smark", "Imported Content");
createTestFile("dir1/main.smark", `[import = imp: "imported.smark" ][end]\n[$use-module = imp][end]`);

// 2. Relative path with ./
createTestFile("dir2/main.smark", `[import = imp: "./imported.smark" ][end]\n[$use-module = imp][end]`);
createTestFile("dir2/imported.smark", "Imported Content Dot Slash");

// 3. Nested imports
createTestFile("nested/c.smark", "Level C Content");
createTestFile("nested/b.smark", `[import = c: "c.smark" ][end]\nLevel B: [$use-module = c][end]`);
createTestFile("nested/a.smark", `[import = b: "b.smark" ][end]\nLevel A: [$use-module = b][end]`);

// 4. Import from parent
createTestFile("parent/common.smark", "Common Content");
createTestFile("parent/subdir/main.smark", `[import = common: "../common.smark" ][end]\n[$use-module = common][end]`);

function runTest(name, mainRelPath, expectedContent) {
    console.log(`\nTesting: ${name}`);
    const mainAbsPath = path.join(testRootDir, mainRelPath);
    try {
        const out = execSync(`node ${path.join(smarkDir, "cli/cli.mjs")} --html -p ${mainAbsPath}`, { 
            cwd: testRootDir,
            encoding: "utf-8" 
        });
        if (out.includes(expectedContent)) {
            console.log("SUCCESS");
        } else {
            console.log("FAILURE: Content not found");
            console.log("Output summary:", out.slice(-200).trim());
        }
    } catch (e) {
        console.log("ERROR: Execution failed");
        console.error(e.stdout || e.stderr || e.message);
    }
}

runTest("Same directory import", "dir1/main.smark", "Imported Content");
runTest("Relative path with ./", "dir2/main.smark", "Imported Content Dot Slash");
runTest("Nested imports", "nested/a.smark", "Level C Content");
runTest("Import from parent", "parent/subdir/main.smark", "Common Content");

// Cleanup
// fs.rmSync(testRootDir, { recursive: true, force: true });
