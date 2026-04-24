import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modulesDir = path.join(__dirname, "modules");

describe("SomMark Module System (Imports & Usage)", () => {

    describe("Basic Functionality", () => {
        it("should successfully import and use a basic Smark module", async () => {
            const src = `
[import = ui: "./modules/B.smark"][end]
[div]
    [$use-module = ui][end]
[end]
            `.trim();

            // Provide current file path to allow relative resolution
            const smark = new SomMark({ src, format: "html", filename: __filename });
            const output = await smark.transpile();

            expect(output).toContain("<div>");
            expect(output).toContain("<button>Click Me</button>");
            expect(output).toContain("</div>");
        });

        it("should handle multiple imports correctly", async () => {
            const src = `
[import = h: "./modules/E.smark"][end]
[import = f: "./modules/C.smark"][end]
[$use-module = h][end]
[$use-module = f][end]
            `.trim();

            const smark = new SomMark({ src, format: "html", filename: __filename });
            const output = await smark.transpile();

            expect(output).toContain("<header>Title</header>");
            expect(output).toContain("<footer>Bottom</footer>");
        });
    });

    describe("Recursion & Scoping", () => {
        it("should support nested imports (recursion)", async () => {
            // Note: A.smark internally imports F.smark
            const src = `
[import = b: "./modules/A.smark"][end]
[$use-module = b][end]
            `.trim();

            const smark = new SomMark({ src, format: "html", filename: __filename });
            const output = await smark.transpile();

            expect(output).toContain("<div>");
            expect(output).toContain("<span>Leaf</span>");
            expect(output).toContain("</div>");
        });
    });

    describe("Error Handling", () => {
        it("should throw an error if import is not at the top level", async () => {
             const src = `
[p]Text started[end]
[import = x: "./modules/B.smark"][end]
             `.trim();

             const smark = new SomMark({ src, format: "html", filename: __filename });
             await expect(smark.transpile()).rejects.toThrow(/Imports must be declared at the top level/);
        });

        it("should throw an error if an undefined alias is used", async () => {
            const src = `[$use-module = missing][end]`;
            const smark = new SomMark({ src, format: "html", filename: __filename });
            await expect(smark.transpile()).rejects.toThrow(/Undefined module alias/);
        });

        it("should throw an error if the imported file does not exist", async () => {
            const src = `[import = x: "./modules/ghost.smark"][end]`;
            const smark = new SomMark({ src, format: "html", filename: __filename });
            await expect(smark.transpile()).rejects.toThrow(/File not found/);
        });

        it("should throw an error for unsupported file extensions", async () => {
            const src = `[import = css: "./modules/style.css"][end]`;
            const smark = new SomMark({ src, format: "html", filename: __filename });
            await expect(smark.transpile()).rejects.toThrow(/Unsupported extension/);
        });
    });

    describe("Advanced Integration", () => {
        it("should propagate placeholders into imported modules", async () => {
            const src = `
[import = g: "./modules/D.smark"][end]
[$use-module = g][end]
            `.trim();

            const smark = new SomMark({ 
                src, 
                format: "html",
                filename: __filename,
                placeholder: { name: "Adam" }
            });
            const output = await smark.transpile();

            expect(output).toBe("Hello Adam!");
        });

        it("should report a warning for unused imports", async () => {
            const src = `[import = x: "./modules/G.smark"][end]\nContent`;
            
            const smark = new SomMark({ src, format: "html", filename: __filename });
            await smark.transpile();

            expect(smark.warnings.some(w => w.type === "UnusedModule")).toBe(true);
        });
    });
});
