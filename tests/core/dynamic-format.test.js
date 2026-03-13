import { describe, it, expect } from "vitest";
import SomMark, { Mapper } from "../../index.js";

describe("Dynamic Formats and Custom Mappers", () => {
    it("should support defining and using custom output formats via plugins", async () => {
        class XmlMapper extends Mapper {
            formatOutput(output, includeDocument) {
                if (includeDocument) {
                    return `<?xml version="1.0" encoding="UTF-8"?>\n<document>\n${output}\n</document>\n`;
                }
                return output;
            }
        }

        const xmlMapper = new XmlMapper();
        xmlMapper.register("bold", ({ content }) => `<important>${content}</important>`);
        xmlMapper.register("h1", ({ content }) => `<title>${content}</title>\n`);
        xmlMapper.register("Block", ({ content }) => content);

        const xmlPlugin = {
            name: "xml-format-plugin",
            format: "xml",
            mapper: xmlMapper
        };

        const src = "[Block](My Title)->(h1)\n[bold]Important message[end][end]";
        const sm = new SomMark({ 
            src, 
            format: "xml", 
            includeDocument: true, 
            plugins: [xmlPlugin] 
        });

        const output = await sm.transpile();

        expect(output).toContain('<?xml version="1.0"');
        expect(output).toContain('<title>My Title</title>');
        expect(output).toContain('<important>Important message</important>');
    });
});
