import { describe, it, expect } from "vitest";
import { transpile, FORMATS } from "../../index.js";
const { htmlFormat } = FORMATS;

describe("AST Access Consistency", () => {
    it("should provide full AST node access to all renderer types", async () => {
        const plugins = [{
            name: "ast-sniffer",
            type: "mapper",
            outputs: [
                {
                    id: "SniffBlock",
                    render: ({ ast, content }) => `<div data-id="${ast.id}" data-type="${ast.type}">Block: ${content}</div>`,
                    options: { type: "Block" }
                },
                {
                    id: "SniffInline",
                    render: ({ ast }) => `<span data-id="${ast.id}" data-type="${ast.type}">Inline</span>`,
                    options: { type: "Inline" }
                },
                {
                    id: "SniffAt",
                    render: ({ ast }) => `<section data-id="${ast.id}" data-type="${ast.type}">AtBlock</section>`,
                    options: { type: "AtBlock" }
                }
            ]
        }];

        const src = "[SniffBlock]\n(test)->(SniffInline)\n@_SniffAt_@\ncontent\n@_end_@\n[end]";
        const output = await transpile({ src, format: htmlFormat, plugins });

        expect(output).toContain('data-id="SniffBlock"');
        expect(output).toContain('data-type="Block"');
        expect(output).toContain('data-id="SniffInline"');
        expect(output).toContain('data-type="Inline"');
        expect(output).toContain('data-id="SniffAt"');
        expect(output).toContain('data-type="AtBlock"');
    });
});
