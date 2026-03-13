import { describe, it, expect } from "vitest";
import SomMark, { FORMATS } from "../../index.js";
const { htmlFormat } = FORMATS;

describe("Plugin and Mapper Registration", () => {
    it("should support unified plugin registration (hooks and outputs array)", async () => {
        const activePlugin = {
            name: "active-plugin",
            registerOutput(sm) {
                sm.register("ActiveTag", ({ content }) => `<div class="active">${content}</div>`, { type: "Block" });
            }
        };

        const concisePlugin = {
            name: "concise-plugin",
            type: "mapper",
            outputs: [
                ["ConciseTag", ({ content }) => `<div class="concise">${content}</div>`, { type: "Block" }]
            ]
        };

        const src = "[ActiveTag]Active[end]\n[ConciseTag]Concise[end]";
        const sm = new SomMark({ src, format: htmlFormat, plugins: [activePlugin, concisePlugin] });
        const output = await sm.transpile();

        expect(output).toContain('<div class="active">Active</div>');
        expect(output).toContain('<div class="concise">Concise</div>');
    });

    it("should support direct registration on the SomMark instance", async () => {
        const src = "[DirectTag]Testing direct registration[end]";
        const sm = new SomMark({ src, format: htmlFormat });

        sm.register("DirectTag", ({ content }) => `<div class="direct">${content}</div>`, { type: "Block" });

        const output = await sm.transpile();
        expect(output).toContain('<div class="direct">Testing direct registration</div>');
        
        // Verify get()
        const outputDef = sm.get("DirectTag");
        expect(outputDef).not.toBeNull();
        expect(outputDef.id).toBe("DirectTag");

        // Verify removeOutput()
        sm.removeOutput("DirectTag");
        expect(sm.get("DirectTag")).toBeNull();
    });
});
