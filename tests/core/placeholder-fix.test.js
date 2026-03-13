import { describe, it, expect } from "vitest";
import { transpile, FORMATS } from "../../index.js";
const { htmlFormat } = FORMATS;

describe("Placeholder Injection Security", () => {
    it("should prevent literal placeholder characters in source from breaking injection", async () => {
        const plugins = [{
            name: "test-plugin",
            type: "mapper",
            outputs: [{
                id: "trap",
                render: ({ content }) => `<div data-debug="Found <%smark>!">${content}</div>`,
                options: { type: "Block" }
            }]
        }];

        const src = `[trap]Inner Content[end]`;
        const output = await transpile({ src, format: htmlFormat, plugins });

        expect(output).toContain(">Inner Content</div>");
        expect(output).toContain('data-debug="Found <%smark>!"');
    });
});
