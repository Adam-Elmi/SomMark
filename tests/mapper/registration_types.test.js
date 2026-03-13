import { describe, it, expect } from "vitest";
import SomMark, { htmlFormat, transpile } from "../../index.js";

describe("Registration Type Enforcement", () => {
    it("allows Block tags in block context", async () => {
        const src = `[div]content[end]`;
        const output = await transpile({ src, format: htmlFormat });
        expect(output).toContain("<div>content</div>");
    });

    it("prevents Block tags in inline context", async () => {
        // Tag 'Html' is registered as type 'Block' in html.js
        const src = `[div](text)->(Html: title="My Page")[end]`;
        try {
            await transpile({ src, format: htmlFormat });
            throw new Error("Should have failed");
        } catch (e) {
            const cleanMsg = e.replace(/\u001b\[[0-9;]*m/g, "");
            expect(cleanMsg).toContain("Validation Error");
            expect(cleanMsg).toContain("is expected to be type 'Block'");
        }
    });

    it("allows 'any' tags in both contexts", async () => {
        const blockSrc = `[bold]block[end]`;
        const inlineSrc = `[div](inline)->(bold)[end]`;
        
        const blockOutput = await transpile({ src: blockSrc, format: htmlFormat });
        const inlineOutput = await transpile({ src: inlineSrc, format: htmlFormat });
        
        expect(blockOutput).toContain("<strong>block</strong>");
        expect(inlineOutput).toContain("<strong>inline</strong>");
    });

    it("handles AtBlock enforcement", async () => {
        const src = `[Table]col1, col2[end]`;
        try {
            await transpile({ src, format: htmlFormat });
            throw new Error("Should have failed");
        } catch (e) {
            const cleanMsg = e.replace(/\u001b\[[0-9;]*m/g, "");
            expect(cleanMsg).toContain("Validation Error");
            expect(cleanMsg).toContain("is expected to be type 'AtBlock'");
        }
    });
});
