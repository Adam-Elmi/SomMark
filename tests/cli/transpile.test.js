import { describe, it, expect } from "vitest";
import { transpile } from "../../cli/helpers/transpile.js";

const simpleSmark = "[Block]\nHello World\n[end]";
const headingSmark = "[Block] (Title)->(h1) [end]\n[Block]\nContent here\n[end]";

describe("CLI Transpile Helper", () => {
    it("should transpile to HTML", async () => {
        const output = await transpile({ src: simpleSmark, format: "html" });
        expect(output).toContain("Hello World");
        expect(output).toContain("<");
    });

    it("should transpile to Markdown", async () => {
        const output = await transpile({ src: simpleSmark, format: "markdown" });
        expect(output).toContain("Hello World");
    });

    it("should transpile to MDX", async () => {
        const output = await transpile({ src: simpleSmark, format: "mdx" });
        expect(output).toContain("Hello World");
    });

    it("should transpile to JSON", async () => {
        const jsonSmark = "[Json]\n(name)->(string: SomMark)\n[end]";
        const output = await transpile({ src: jsonSmark, format: "json" });
        expect(output).toContain("SomMark");
    });

    it("should transpile to text", async () => {
        const output = await transpile({ src: simpleSmark, format: "text" });
        expect(output).toContain("Hello World");
    });

    it("should throw on empty source", async () => {
        await expect(transpile({ src: "", format: "html" })).rejects.toThrow();
    });

    it("should handle multiple blocks", async () => {
        const output = await transpile({ src: headingSmark, format: "html" });
        expect(output).toContain("Title");
        expect(output).toContain("Content here");
    });
});
