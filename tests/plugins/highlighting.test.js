import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";

describe("Syntax Highlighting (Modular Architecture)", () => {
    it("should allow a plugin/user to override the Code block for custom highlighting", async () => {
        const sm = new SomMark({ 
            src: "[Block]\n@_Code_@: js; const x = 1 @_end_@\n[end]", 
            format: "html" 
        });

        // Manually override Code registration to simulate a highlighting plugin
        sm.mapperFile.register("Code", ({ args, content }) => {
            const lang = sm.mapperFile.safeArg(args, 0, "lang", null, null, "text");
            return `<pre class="custom-prism-theme" style="color: red;"><code class="language-${lang}"><u>${content}</u></code></pre>`;
        }, { escape: false, type: "AtBlock" });
        
        const output = await sm.transpile();
        expect(output).toContain('class="custom-prism-theme"');
        expect(output).toContain('style="color: red;"');
        expect(output).toContain('<u> const x = 1 </u>');
    });

    it("should allow highlighting plugins to register themselves via hooks", async () => {
        const highlighterPlugin = {
            name: "test-highlighter",
            register: (sm) => {
                sm.mapperFile.register("Code", ({ args, content }) => {
                    const lang = sm.mapperFile.safeArg(args, 0, "lang", null, null, "text");
                    return `[[${lang}:${content}]]`;
                }, { escape: false, type: "AtBlock" });
            }
        };

        const sm = new SomMark({
            src: "[Block]\n@_Code_@: python; print('hello') @_end_@\n[end]",
            format: "html",
            plugins: [highlighterPlugin]
        });

        const output = await sm.transpile();
        expect(output).toContain("[[python: print('hello') ]]");
    });
});
