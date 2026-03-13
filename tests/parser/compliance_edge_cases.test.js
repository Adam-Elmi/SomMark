import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";

describe("Parser Compliance & Edge Cases", () => {
    it("supports identifiers with $, _, and - in blocks", async () => {
        const smark = new SomMark({
            src: "[div = id: $my_id-1, class: _my_class_]Hello[end]",
            format: "html"
        });
        const result = await smark.transpile();
        expect(result).toContain("id=\"$my_id-1\"");
        expect(result).toContain("class=\"_my_class_\"");
    });

    it("supports identifiers with $, _, and - in inline statements", async () => {
        // (content)->(url: href, title)
        const smark = new SomMark({
            src: "[div](Google)->(url: https://google.com)[end]",
            format: "html"
        });
        const result = await smark.transpile();
        expect(result).toContain("href=\"https://google.com\"");
    });

    it("prevents using 'end' as an identifier in blocks", async () => {
        const smark = new SomMark({
            src: "[end]Content[end]",
            format: "html"
        });
        await expect(smark.transpile()).rejects.toThrow(/'end' is a reserved keyword/);
    });

    it("prevents using 'end' as an identifier in blocks (even with args)", async () => {
        const smark = new SomMark({
            src: "[end = attr: val]Content[end]",
            format: "html"
        });
        await expect(smark.transpile()).rejects.toThrow(/'end' is a reserved keyword/);
    });

    it("prevents using 'end' as an identifier in inline statements", async () => {
        const smark = new SomMark({
            src: "[div](val)->(end: 'param')[end]",
            format: "html"
        });
        await expect(smark.transpile()).rejects.toThrow(/'end' is a reserved keyword/);
    });

    it("handles arguments in inline statements correctly without redundant mapping", async () => {
        const smark = new SomMark({
            src: "[div](Google)->(url: https://google.com, MyTitle)[end]",
            format: "html"
        });
        const result = await smark.transpile();
        expect(result).toContain("title=\"MyTitle\"");
    });
});
