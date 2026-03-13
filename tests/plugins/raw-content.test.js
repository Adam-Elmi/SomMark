import { describe, it, expect, beforeEach } from "vitest";
import SomMark from "../../index.js";
import { htmlFormat } from "../../core/formats.js";
import fs from "node:fs/promises";

describe("Plugin: raw-content integration", () => {
    let sm;
    let src;

    beforeEach(async () => {
        src = await fs.readFile("tests/complex_raw_test/raw.smark", "utf-8");
        sm = new SomMark({
            format: htmlFormat,
            includeDocument: false,
            plugins: [
                { name: "raw-content", options: { targetBlocks: ["Raw", "MDX", "Code"] } }
            ]
        });

        sm.register("Raw", ({ content }) => `<div class="raw">${content}</div>`);
        sm.register("MDX", ({ args, content }) => `<div class="mdx" data-comp="${args[0]}">${content}</div>`);
        sm.register("Code", ({ args, content }) => `<pre><code class="lang-${args[0]}">${content}</code></pre>`);
    });

    it("should preserve complex raw content and whitespace", async () => {
        const output = await sm.transpile(src);

        // Verification matches test_raw_content.js checks
        expect(output).toContain("[NestedButShouldBeEscaped]");
        expect(output).toContain("onClick={() =&gt; console.log(&quot;clicked&quot;)}");
        expect(output).toContain("[1, 2, 3]");
        expect(output).toContain("key: &quot;val&quot;");
        expect(output).toContain("(a, b) =&gt; a + b");
        expect(output).toContain("Backslash: \\");
        
        // Ensure whitespace preservation (indentation)
        expect(output).toContain("\n  This content should be escaped:");
        expect(output).toContain("\n  import { Button } from &#39;./ui&#39;;");
    });
});
