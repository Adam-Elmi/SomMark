import SomMark, { fileHandler } from "./index.js";
import fs from "node:fs/promises";

// ── 1. pure function in variables ────────────────────────────────────────────
const r1 = await new SomMark({
    src: `static \${ return add(2, 3); }\$`,
    format: "html",
    variables: { add: (a, b) => a + b }
}).transpile();
console.log("1. pure function  →", r1);

// ── 2. pathHandler global (pathe) ────────────────────────────────────────────
const r2 = await new SomMark({
    src: `static \${ return pathHandler.join("src", "pages", "index.smark"); }\$`,
    format: "html",
}).transpile();
console.log("2. pathHandler    →", r2);

// ── 3. fileHandler global — read ─────────────────────────────────────────────
const r3 = await new SomMark({
    src: `static \${
        const content = await fileHandler.read("package.json");
        const pkg = JSON.parse(content);
        return pkg.name + " v" + pkg.version;
    }\$`,
    format: "html",
}).transpile();
console.log("3. fileHandler    →", r3);

// ── 4. fileHandler global — exists ───────────────────────────────────────────
const r4 = await new SomMark({
    src: `static \${ return await fileHandler.exists("package.json"); }\$`,
    format: "html",
}).transpile();
console.log("4. exists         →", r4);

// ── 5. function in variables using fileHandler + pathHandler ─────────────────
const r5 = await new SomMark({
    src: `static \${
        const deps = await getDeps();
        return Object.keys(deps).join(", ");
    }\$`,
    format: "html",
    variables: {
        getDeps: async () => {
            const content = await fileHandler.read("package.json");
            return JSON.parse(content).dependencies;
        }
    }
}).transpile();
console.log("5. fn + handler   →", r5);

// ── 6. fileHandler exported — direct Node.js usage ───────────────────────────
const content = await fileHandler.read("package.json");
const pkg = JSON.parse(content);
console.log("6. direct export  →", pkg.name);

// ── 7. path traversal blocked ────────────────────────────────────────────────
try {
    await new SomMark({
        src: `static \${ return await fileHandler.read("../../etc/passwd"); }\$`,
        format: "html",
    }).transpile();
} catch (e) {
    console.log("7. traversal      → blocked ✓");
}

// ── 8. nested function — should warn, be skipped ─────────────────────────────
console.log("8. nested fn warn →");
await new SomMark({
    src: `static \${ return 1; }\$`,
    format: "html",
    variables: { utils: { helper: (x) => x * 2 } }
}).transpile();

// ── 9. SomMark.compile inside static block — simple source (no imports) ──────
const r9 = await new SomMark({
    src: `static \${
        const html = await SomMark.compile("[h1]Hello World[end:h1]", { format: "html" });
        return SomMark.raw(html);
    }\$`,
    format: "html",
}).transpile();
console.log("9. SomMark.compile (simple) →", r9);

// ── 10. SomMark.compile with fileHandler — read and compile another file ─────
const testSrc = `[h1]Test Heading[end:h1]\n[p]Some content[end:p]`;
await fs.writeFile("_test_compile.smark", testSrc);

const r10 = await new SomMark({
    src: `static \${
        const src = await fileHandler.read("_test_compile.smark");
        const html = await SomMark.compile(src, { format: "html" });
        return SomMark.raw(html);
    }\$`,
    format: "html",
}).transpile();
console.log("10. SomMark.compile (file) →", r10);

await fs.unlink("_test_compile.smark");

// ── 11. SomMark.compile — file with imports (tests fs inheritance) ────────────
await fs.writeFile("_test_component.smark", `[h2]Imported Component[end:h2]`);
await fs.writeFile("_test_with_import.smark",
    `[import = Card: "./_test_component.smark" !]\n[Card !]`
);

const r11 = await new SomMark({
    src: `static \${
        const src = await fileHandler.read("_test_with_import.smark");
        const html = await SomMark.compile(src, { format: "html" });
        return SomMark.raw(html);
    }\$`,
    format: "html",
}).transpile();
console.log("11. SomMark.compile (imports) →", r11);

await fs.unlink("_test_component.smark");
await fs.unlink("_test_with_import.smark");

// ── 12. SomMark.compile inside a variables function ───────────────────────────
await fs.writeFile("_test_headings.smark", [
    "[h1]Introduction[end:h1]",
    "[p]Some content[end:p]",
    "[h2]Installation[end:h2]",
    "[h3]Requirements[end:h3]",
].join("\n"));

const r12 = await new SomMark({
    src: `static \${ return await getHeadings("_test_headings.smark"); }\$`,
    format: "html",
    variables: {
        getHeadings: async (filePath) => {
            const src = await fileHandler.read(filePath);
            const html = await SomMark.compile(src, { format: "html" });
            const headings = [];
            for (let level = 1; level <= 6; level++) {
                const re = new RegExp("<h" + level + "[^>]*>([\\s\\S]*?)<\\/h" + level + ">", "gi");
                let match;
                while ((match = re.exec(html)) !== null) {
                    const text = match[1].replace(/<[^>]+>/g, "").trim();
                    if (text) headings.push({ level, text });
                }
            }
            headings.sort((a, b) => html.indexOf("<h" + a.level) - html.indexOf("<h" + b.level));
            return SomMark.raw(JSON.stringify(headings));
        }
    }
}).transpile();
console.log("12. compile in variables fn →", r12);
await fs.unlink("_test_headings.smark");

// ── 13. SomMark.lexer ─────────────────────────────────────────────────────────
const r13 = await new SomMark({
    src: `static \${
        const tokens = SomMark.lexer("[h1]Hello[end:h1]");
        return tokens.length + " tokens, first: " + tokens[0].type;
    }\$`,
    format: "html",
}).transpile();
console.log("13. SomMark.lexer  →", r13);

// ── 14. SomMark.parser — getHeadings via AST ─────────────────────────────────
await fs.writeFile("_test_headings2.smark", [
    "[h1]Introduction[end:h1]",
    "[p]Some content[end:p]",
    "[h2]Installation[end:h2]",
    "[h3]Requirements[end:h3]",
].join("\n"));

const r14 = await new SomMark({
    src: `static \${ return await getHeadings("_test_headings2.smark"); }\$`,
    format: "html",
    variables: {
        getHeadings: async (filePath) => {
            const src = await fileHandler.read(filePath);
            const nodes = SomMark.parser(src);
            const headings = [];
            const headingIds = { h1:1, h2:2, h3:3, h4:4, h5:5, h6:6 };
            for (const node of nodes) {
                const level = headingIds[node.id];
                if (!level) continue;
                const text = node.body
                    .filter(n => n.type === "Text")
                    .map(n => n.text)
                    .join("").trim();
                headings.push({ level, text });
            }
            return SomMark.raw(JSON.stringify(headings));
        }
    }
}).transpile();
console.log("14. SomMark.parser →", r14);
await fs.unlink("_test_headings2.smark");

// ── 15. webOutputs — basic: [style] extracted, removed from HTML ──────────────
const [r15html, r15css, r15js] = await new SomMark({
    src: `[style]\nbody { margin: 0; }\n[end]\n[p]Hello[end:p]`,
    format: "html",
    webOutputs: true,
}).transpile();
const r15ok = !r15html.includes("<style>") && r15css.includes("margin: 0") && r15js === "";
console.log("15. webOutputs basic    →", r15ok ? "✓" : `✗  html=${r15html}  css=${r15css}`);

// ── 16. webOutputs — multiple [style] blocks unified ─────────────────────────
const [r16html, r16css] = await new SomMark({
    src: `[style]\n.a { color: red; }\n[end]\n[p]Text[end:p]\n[style]\n.b { color: blue; }\n[end]`,
    format: "html",
    webOutputs: true,
}).transpile();
const r16ok = r16css.includes(".a") && r16css.includes(".b") && !r16html.includes("<style>");
console.log("16. webOutputs multi    →", r16ok ? "✓" : `✗  css=${r16css}`);

// ── 17. webOutputs — [style] with static logic ───────────────────────────────
const [r17html, r17css] = await new SomMark({
    src: `[style]\n\${ return ".dynamic { font-size: 1rem; }"; }\$\n[end]\n[p]Hi[end:p]`,
    format: "html",
    webOutputs: true,
}).transpile();
const r17ok = r17css.includes(".dynamic") && !r17html.includes("<style>");
console.log("17. webOutputs static logic →", r17ok ? "✓" : `✗  css=${r17css}`);

// ── 18. webOutputs — [style] nested inside a block ───────────────────────────
const [r18html, r18css] = await new SomMark({
    src: `[div]\n[style]\n.nested { padding: 0; }\n[end]\n[p]Inner[end:p]\n[end]`,
    format: "html",
    webOutputs: true,
}).transpile();
const r18ok = r18css.includes(".nested") && !r18html.includes("<style>");
console.log("18. webOutputs nested   →", r18ok ? "✓" : `✗  css=${r18css}`);

// ── 19. webOutputs — runtime JS still emitted correctly ──────────────────────
const [r19html, r19css, r19js] = await new SomMark({
    src: `[style]\nbody { margin: 0; }\n[end]\n[p]Hi[end:p]\nruntime \${ document.querySelector("p").textContent = "ok"; }\$`,
    format: "html",
    webOutputs: true,
}).transpile();
const r19ok = r19css.includes("margin: 0") && r19js.includes("document.querySelector");
console.log("19. webOutputs + runtime →", r19ok ? "✓" : `✗  css=${r19css}  js=${r19js}`);

// ── 20. webOutputs — [style] inside [head] ────────────────────────────────────
const [r20html, r20css] = await new SomMark({
    src: `[head]\n[style]\nbody { margin: 0; }\n[end]\n[end:head]\n[p]Hello[end:p]`,
    format: "html",
    webOutputs: true,
}).transpile();
const r20ok = r20css.includes("margin: 0") && !r20html.includes("<style>");
console.log("20. webOutputs [head]   →", r20ok ? "✓" : `✗  css=${r20css}  html=${r20html}`);

// ── 21. webOutputs — [Root] CSS variables extracted ──────────────────────────
const [r21html, r21css] = await new SomMark({
    src: `[Root = --color: red !]\n[head]\n[end:head]\n[p]Hello[end:p]`,
    format: "html",
    webOutputs: true,
}).transpile();
const r21ok = r21css.includes("--color") && !r21html.includes("<style>");
console.log("21. webOutputs [Root]   →", r21ok ? "✓" : `✗  css=${r21css}  html=${r21html}`);
