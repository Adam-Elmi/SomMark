import { describe, it, expect } from "vitest";
import { transpile } from "../../index.js";

describe("HTML Mapper: Style Merging", () => {
    const options = { format: "html", includeDocument: false };

    it("merges explicit style with individual CSS arguments", async () => {
        const src = '[div = style: "color:red", width: 100]Content[end]';
        const result = await transpile({ src, ...options });
        // kebabize(width) is width, but since it's not in HTML_PROPS for div, it goes to style
        expect(result).toContain('style="color:red;width:100;"');
    });

    it("handles background-color correctly", async () => {
        const src = '[div = background-color: #eee]Content[end]';
        const result = await transpile({ src, ...options });
        expect(result).toContain('style="background-color:#eee;"');
    });

    it("handles CSS variables with -- prefix", async () => {
        const src = '[div = color: --primary-color]Content[end]';
        const result = await transpile({ src, ...options });
        // TagBuilder expands --vars to var(--vars)
        expect(result).toContain('style="color:var(--primary-color);"');
    });

    it("manages dimension attributes for supported tags (skips style merging)", async () => {
        const src = '[img = src: "img.png", width: 500][end]';
        const result = await transpile({ src, ...options });
        expect(result).toContain('width="500"');
        expect(result).not.toContain('style=');
    });

    it("merges style with camelCase conversion", async () => {
        const src = '[div = fontSize: "16px"]Content[end]';
        const result = await transpile({ src, ...options });
        expect(result).toContain('style="font-size:16px;"');
    });

    it("preserves explicit semicolon in style", async () => {
        const src = '[div = style: "display:flex;", flex-direction: column]Content[end]';
        const result = await transpile({ src, ...options });
        expect(result).toContain('style="display:flex;flex-direction:column;"');
    });
});
