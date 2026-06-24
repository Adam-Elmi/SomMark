import { describe, it, expect } from 'vitest';
import SomMark from '../../index.js';

describe('smark-raw prop (raw body)', () => {
    describe('basic behavior', () => {
        it("passes content unchanged — HTML special chars are not escaped", async () => {
            const sm = new SomMark({ src: "[verbatim = smark-raw: true]<h1>Hello & World</h1>[end]", format: "html" });
            const out = await sm.transpile();
            expect(out).toBe("<verbatim><h1>Hello & World</h1></verbatim>");
        });

        it("leaves nested SomMark syntax unparsed", async () => {
            const sm = new SomMark({ src: "[raw = smark-raw: true]unparsed -> [p]Hello\\[end][end]", format: "html" });
            const out = await sm.transpile();
            expect(out).toBe("<raw>unparsed -> [p]Hello[end]</raw>");
        });

        it("preserves inner whitespace exactly", async () => {
            const sm = new SomMark({ src: "[pre = smark-raw: true]line1\n  line2[end]", format: "html" });
            expect(await sm.transpile()).toBe("<pre>line1\n  line2</pre>");
        });

        it("allows literal [end] inside content via \\[ escape", async () => {
            const sm = new SomMark({ src: "[pre = smark-raw: true]use \\[end] here[end]", format: "html" });
            expect(await sm.transpile()).toBe("<pre>use [end] here</pre>");
        });

        it("works inside nested blocks", async () => {
            const sm = new SomMark({ src: "[div][span = smark-raw: true]<b>raw</b>[end][end]", format: "html" });
            expect(await sm.transpile()).toBe("<div><span><b>raw</b></span></div>");
        });
    });

    describe('mapper interaction', () => {
        it("calls registered mapper with raw content", async () => {
            const sm = new SomMark({ src: "[mycode = smark-raw: true]<script>alert(1)</script>[end]", format: "html" });
            sm.register("mycode", function({ content }) {
                return `<pre>${content}</pre>`;
            });
            expect(await sm.transpile()).toBe("<pre><script>alert(1)</script></pre>");
        });

        it("passes non-smark-raw args to mapper, stripping smark-raw", async () => {
            const sm = new SomMark({ src: '[mycode = smark-raw: true, lang: "js"]const x = 1;[end]', format: "html" });
            let receivedArgs = null;
            sm.register("mycode", function({ props, content }) {
                receivedArgs = props;
                return `<pre data-lang="${props.lang}">${content}</pre>`;
            });
            const out = await sm.transpile();
            expect(out).toBe('<pre data-lang="js">const x = 1;</pre>');
            expect(receivedArgs["smark-raw"]).toBeUndefined();
            expect(receivedArgs.lang).toBe("js");
        });

        it("args (minus smark-raw) reach getUnknownTag as HTML attributes", async () => {
            const sm = new SomMark({ src: '[x = class: "a", smark-raw: true]<b>ok</b>[end]', format: "html" });
            expect(await sm.transpile()).toBe('<x class="a"><b>ok</b></x>');
        });

        it("custom mapper with handleAst receives ast node, body is a single raw TEXT node", async () => {
            const sm = new SomMark({ src: "[myblock = smark-raw: true]<b>raw</b>[end]", format: "html" });
            let capturedAst = null;
            sm.register("myblock", function({ content, ast }) {
                capturedAst = ast;
                return `[handled:${content}]`;
            }, { handleAst: true });
            const out = await sm.transpile();
            expect(out).toBe("[handled:<b>raw</b>]");
            // ast is the real node — body contains one TEXT node with the unparsed content
            expect(capturedAst).toBeTruthy();
            expect(capturedAst.body[0].text).toBe("<b>raw</b>");
        });

        it("text format getUnknownTag passes raw content through unchanged", async () => {
            // text mapper's getUnknownTag returns content as-is, no wrapping
            const sm = new SomMark({ src: "[myblock = smark-raw: true]<b>raw content</b>[end]", format: "text" });
            expect(await sm.transpile()).toBe("<b>raw content</b>");
        });

        it("with getUnknownTag (HTML format, no explicit registration): wraps in HTML element", async () => {
            const sm = new SomMark({ src: "[myblock = smark-raw: true]<b>raw content</b>[end]", format: "html" });
            const out = await sm.transpile();
            expect(out).toBe("<myblock><b>raw content</b></myblock>");
        });
    });

    describe('smark-raw with dualOutput', () => {
        it("does not leak raw block content into JS runtime output", async () => {
            const src = `[pre = smark-raw: true]\n[div]Hello\\[end]\n[end]`;
            const sm = new SomMark({ src, format: "html", dualOutput: true });
            const [html, js] = await sm.transpile();
            expect(html).toContain("<pre>");
            expect(html).toContain("[div]Hello[end]");
            expect(js).toBe("");
        });

        it("does not include runtime blocks inside smark-raw in JS output", async () => {
            const src = `[pre = smark-raw: true]runtime \${alert(1)}$\\[end][end]`;
            const sm = new SomMark({ src, format: "html", dualOutput: true });
            const [, js] = await sm.transpile();
            expect(js).toBe("");
        });
    });

    describe('smark-raw with other args', () => {
        it("works when smark-raw comes after other args", async () => {
            const sm = new SomMark({ src: '[x = class: "a", smark-raw: true]<b>ok</b>[end]', format: "html" });
            expect(await sm.transpile()).toBe('<x class="a"><b>ok</b></x>');
        });

        it("does not activate on smark-raw: false", async () => {
            const sm = new SomMark({ src: "[div = smark-raw: false]text[end]", format: "html" });
            const out = await sm.transpile();
            expect(out).not.toBe("text");
            expect(out).toContain("<div");
            expect(out).toContain("text");
        });
    });
});
