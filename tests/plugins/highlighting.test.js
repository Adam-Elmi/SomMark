import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";

describe("Syntax Highlighting Enhancements", () => {
    it("should support object-based returns from highlightCode for custom attributes", async () => {
        const sm = new SomMark({ 
            src: "[Block]\n@_Code_@: js; const x = 1 @_end_@\n[end]", 
            format: "html" 
        });
        sm.mapperFile.highlightCode = (code, lang) => {
            return {
                html: `<u>${code}</u>`,
                class: "custom-prism-theme",
                style: "color: red;"
            };
        };
        
        const output = await sm.transpile();
        expect(output).toContain('class="custom-prism-theme"');
        expect(output).toContain('style="color: red;"');
        expect(output).toContain('<u> const x = 1 </u>');
    });

    it("should automatically link highlighting plugins to the mapper", async () => {
        const highlighterPlugin = {
            name: "test-highlighter",
            highlighter: (code, lang) => `[[${lang}:${code}]]`
        };

        const sm = new SomMark({
            src: "[Block]\n@_Code_@: python; print('hello') @_end_@\n[end]",
            format: "html",
            plugins: [highlighterPlugin]
        });

        const output = await sm.transpile();
        expect(output).toContain("[[python: print('hello') ]]");
        expect(output).toContain('class="language-python"');
    });
});
