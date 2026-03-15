import { describe, it, expect } from "vitest";
import { transpile } from "../../index.js";

describe("Plugin: module-system", () => {
    const defaultOptions = { includeDocument: false };

    it("successfully imports a .smark file", async () => {
        const src = '[[import = $header: "tests/fixtures/header.smark"]]\n[Block]\n$[[header]]\n[end]';
        const result = await transpile({ src, ...defaultOptions });
        expect(result).toContain("Nested Header Content");
    });

    it("successfully imports a .css file", async () => {
        const src = '[[import = $style: "tests/fixtures/style.css"]]\n[Block]\n$[[style]]\n[end]';
        const result = await transpile({ src, ...defaultOptions });
        expect(result).toContain(".text-red");
    });

    it("throws error for missing $ in import key", async () => {
        const src = '[[import = header: "tests/fixtures/header.smark"]]\n$[[header]]';
        await expect(transpile({ src, ...defaultOptions })).rejects.toThrow();
    });

    it("throws error for non-existent file", async () => {
        const src = '[[import = $missing: "tests/fixtures/missing.smark"]]\n$[[missing]]';
        await expect(transpile({ src, ...defaultOptions })).rejects.toThrow();
    });

    it("throws error for unsupported file extension", async () => {
        const src = '[[import = $data: "package.json"]]\n$[[data]]';
        await expect(transpile({ src, ...defaultOptions })).rejects.toThrow();
    });

    it("throws error for unused import", async () => {
        const src = '[[import = $unused: "tests/fixtures/header.smark"]]\n[Block]Hello[end]';
        await expect(transpile({ src, ...defaultOptions })).rejects.toThrow();
    });

    it("throws error for import after block", async () => {
        const src = '[Block]Hello[end]\n[[import = $late: "tests/fixtures/header.smark"]]\n$[[late]]';
        await expect(transpile({ src, ...defaultOptions })).rejects.toThrow();
    });

    describe("Complex Integration", () => {
        it("successfully transpiles large multi-file project (20+ imports)", async () => {
            const fs = await import("node:fs/promises");
            const SomMark = (await import("../../index.js")).default;
            const { htmlFormat } = await import("../../core/formats.js");

            const srcPath = "tests/complex_module_test/main.smark";
            const src = await fs.readFile(srcPath, "utf-8");
            
            const sm = new SomMark({
                format: htmlFormat,
                includeDocument: false,
                plugins: [
                    { name: "raw-content", options: { targetBlocks: ["Style", "Code"] } }
                ]
            });

            // Register custom tags used in the complex test
            sm.register("Page", ({ content }) => `<div class="page">${content}</div>`);
            sm.register("Navbar", ({ content }) => `<nav>${content}</nav>`);
            sm.register("Logo", ({ args }) => `<div class="logo">${args[0]}</div>`);
            sm.register("Menu", ({ content }) => `<ul>${content}</ul>`);
            sm.register("Item", ({ args }) => `<li>${args[0]}</li>`);
            sm.register("Section", ({ args, content }) => `<section><h2>${args[0]}</h2>${content}</section>`);
            sm.register("Footer", ({ content }) => `<footer>${content}</footer>`);
            sm.register("Text", ({ content }) => `<p>${content}</p>`);
            sm.register("Style", ({ content }) => `<style>${content}</style>`);
            sm.register("Code", ({ args, content }) => `<pre><code class="language-${args[0]}">${content}</code></pre>`);

            const output = await sm.transpile(src);

            expect(output).toContain("<nav>");
            expect(output).toContain("SomMark Logo");
            expect(output).toContain(".container {");
            expect(output).toContain("export function formatName");
            expect(output).toContain('class="page"');

            for (let i = 1; i <= 20; i++) {
                expect(output).toContain(`This is import ${i}`);
            }
        });
    });
});
