import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";

describe("Plugin Options System", () => {
    it("overrides built-in plugin options using { name, options }", async () => {
        // raw-content defaults to ["mdx"]
        // We will override it to ["custom-raw"]
        const smark = new SomMark({
            src: "[custom-raw]import { X } from 'Y'[end]",
            format: "mdx",
            plugins: [
                { name: "raw-content", options: { targetBlocks: ["custom-raw"] } }
            ]
        });

        const result = await smark.transpile();
        // If it worked, the content inside should be preserved
        expect(result).toContain("import { X } from");
        expect(result).toContain("Y");
    });

    it("passes options to external plugins using { plugin, options }", async () => {
        const mockPlugin = {
            name: "mock-plugin",
            type: "transform",
            options: { prefix: "DEFAULT:" },
            transform(output) {
                return (this.options?.prefix || "") + output;
            }
        };

        const smark = new SomMark({
            src: "[div]content[end]",
            format: "html",
            plugins: [
                { plugin: mockPlugin, options: { prefix: "CUSTOM:" } }
            ]
        });

        const result = await smark.transpile();
        expect(result).toContain("CUSTOM:");
    });

    it("ensures isolation between SomMark instances", async () => {
        const mockPlugin = {
            name: "isolated-plugin",
            type: "transform",
            options: { val: 1 },
            transform(output) {
                return output + this.options.val;
            }
        };

        const smark1 = new SomMark({
            src: "[div]A[end]",
            format: "html",
            plugins: [{ plugin: mockPlugin, options: { val: 100 } }]
        });

        const smark2 = new SomMark({
            src: "[div]B[end]",
            format: "html",
            plugins: [{ plugin: mockPlugin, options: { val: 200 } }]
        });

        const res1 = await smark1.transpile();
        const res2 = await smark2.transpile();

        expect(res1).toContain("100");
        expect(res2).toContain("200");
    });
    
    it("handles plugins without options property gracefully", async () => {
        const simplePlugin = {
            name: "simple",
            type: "transform",
            transform(output) { return "SAFE:" + output; }
        };
        
        const smark = new SomMark({
            src: "[div]data[end]",
            format: "html",
            plugins: [simplePlugin]
        });
        
        const result = await smark.transpile();
        expect(result).toContain("SAFE:");
    });
});
