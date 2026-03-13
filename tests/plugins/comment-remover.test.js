import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import { htmlFormat } from "../../core/formats.js";

describe("Comment Remover Plugin", () => {
    const registerTags = (sm) => {
        sm.register("Header", ({ content }) => `<header>${content}</header>`);
        sm.register("Title", ({ content }) => `<h1>${content}</h1>`);
        sm.register("Section", ({ args, content }) => `<section><h2>${args[0]}</h2>${content}</section>`);
        sm.register("Div", ({ content }) => `<div>${content}</div>`);
        sm.register("Footer", ({ content }) => `<footer>${content}</footer>`);
    };

    it("should remove comments when the plugin is enabled", async () => {
        const sm = new SomMark({
            plugins: ["comment-remover"],
            format: htmlFormat,
            includeDocument: false
        });
        registerTags(sm);
        const output = await sm.transpile("[Div]# This is a comment\nHello World\n[end]");
        expect(output).not.toContain("<!-- This is a comment-->");
        expect(output).toContain("Hello World");
    });

    it("should preserve comments when the plugin is disabled", async () => {
        const sm = new SomMark({
            plugins: [],
            format: htmlFormat,
            includeDocument: false
        });
        registerTags(sm);
        const output = await sm.transpile("[Div]# This is a comment\nHello World\n[end]");
        expect(output).toContain("<!-- This is a comment-->");
        expect(output).toContain("Hello World");
    });

    describe("Complex Integration", () => {
        it("should correctly remove all comments in a complex multi-block source", async () => {
            const fs = await import("node:fs/promises");
            
            const srcPath = "tests/complex_comment_test/comments.smark";
            const src = await fs.readFile(srcPath, "utf-8");
            
            const smWithDefaults = new SomMark({
                format: htmlFormat,
                includeDocument: false
            });
            registerTags(smWithDefaults);
            const outputWithComments = await smWithDefaults.transpile(src);

            const smWithRemover = new SomMark({
                format: htmlFormat,
                includeDocument: false,
                plugins: ["comment-remover"]
            });
            registerTags(smWithRemover);
            const outputWithoutComments = await smWithRemover.transpile(src);

            expect(outputWithComments).toContain("<!--");
            expect(outputWithoutComments).not.toContain("<!--");
            expect(outputWithoutComments).not.toContain("#");
            expect(outputWithoutComments).toContain("Welcome");
            expect(outputWithoutComments).toContain("Inner content");
            expect(outputWithoutComments).toContain("Done");
        });
    });
});
