import { describe, it, expect } from "vitest";
import SomMark, { FORMATS } from "../../index.js";
const { htmlFormat } = FORMATS;

describe("Mapper Isolation", () => {
    it("should ensure instances have isolated mapper states", async () => {
        // Instance 1
        const sm1 = new SomMark({ src: "[UniqueTag]Hello[end]", format: htmlFormat, includeDocument: false });
        sm1.register("UniqueTag", ({ content }) => `<div class="unique">${content}</div>`);

        expect(sm1.get("UniqueTag")).toBeTruthy();
        const output1 = await sm1.transpile();
        expect(output1).toContain('<div class="unique">Hello</div>');

        // Instance 2 should have its own registration
        const sm2 = new SomMark({ src: "[UniqueTag]Isolated![end]", format: htmlFormat, includeDocument: false });
        sm2.register("UniqueTag", ({ content }) => `<span class="other">${content}</span>`);
        
        expect(sm2.get("UniqueTag")).toBeTruthy();
        const output2 = await sm2.transpile();
        expect(output2).toContain('<span class="other">Isolated!</span>');
        expect(output2).not.toContain('<div class="unique">');
    });
});
