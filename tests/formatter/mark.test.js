
import { describe, it, expect } from "vitest";
import MarkdownBuilder from "../../formatter/mark.js";

describe("MarkdownBuilder", () => {
    const md = new MarkdownBuilder();

    describe("heading", () => {
        it("creates headings with correct levels", () => {
            expect(md.heading("Title", 1)).toBe("# Title\n");
            expect(md.heading("Subtitle", 2)).toBe("## Subtitle\n");
            expect(md.heading("Deep", 6)).toBe("###### Deep\n");
        });

        it("clamps levels between 1 and 6", () => {
            expect(md.heading("Low", 0)).toBe("# Low\n");
            expect(md.heading("High", 7)).toBe("###### High\n");
        });

        it("handles string levels", () => {
            expect(md.heading("Title", "1")).toBe("# Title\n");
        });

        it("returns empty string if no text", () => {
            expect(md.heading("", 1)).toBe("# \n");
        });
    });

    describe("bold", () => {
        it("bolds text with asterisks by default", () => {
            expect(md.bold("bold")).toBe("**bold**");
        });

        it("bolds text with underscores if requested", () => {
            expect(md.bold("bold", true)).toBe("__bold__");
        });

        it("returns empty string if no text", () => {
            expect(md.bold("")).toBe("");
        });
    });

    describe("italic", () => {
        it("italicizes text with asterisks by default", () => {
            expect(md.italic("italic")).toBe("*italic*");
        });

        it("italicizes text with underscores if requested", () => {
            expect(md.italic("italic", true)).toBe("_italic_");
        });

        it("returns empty string if no text", () => {
            expect(md.italic("")).toBe("");
        });
    });

    describe("codeBlock", () => {
        it("creates a code block with language", () => {
            expect(md.codeBlock("code", "js")).toBe("\n```js\ncode\n```\n");
        });

        it("creates a code block without language", () => {
            expect(md.codeBlock("code")).toBe("\n```\ncode\n```\n");
        });

        it("handles array of code lines", () => {
            expect(md.codeBlock(["line1", "line2"], "js")).toBe("\n```js\nline1\nline2\n```\n");
        });
    });

    describe("url", () => {
        it("creates a basic link", () => {
            expect(md.url("", "text", "http://url.com")).toBe(" [text](http://url.com) ");
        });

        it("creates an image link", () => {
            expect(md.url("image", "alt", "img.png")).toBe(" ![alt](img.png) ");
        });

        it("adds title if provided", () => {
            expect(md.url("", "text", "url", "title")).toBe(" [text](url title) ");
        });
    });

    describe("table", () => {
        it("creates a table", () => {
            const headers = ["H1", "H2"];
            const rows = ["R1C1, R1C2", "R2C1, R2C2"];
            const output = md.table(headers, rows);
            expect(output).toContain("| H1 | H2 |");
            expect(output).toContain("|----|----|");
            expect(output).toContain("| R1C1 | R1C2 |");
        });

        it("handles array rows", () => {
            const headers = ["A"];
            const rows = [["val"]];
            const output = md.table(headers, rows);
            expect(output).toContain("| val |");
        });
    });

    describe("todo", () => {
        it("creates unchecked todo", () => {
            expect(md.todo(false, "Task")).toBe("- [ ] Task\n");
        });

        it("creates checked todo", () => {
            expect(md.todo(true, "Done")).toBe("- [x] Done\n");
        });
    });

    describe("horizontal", () => {
        it("creates default rule", () => {
            expect(md.horizontal()).toBe("\n***\n");
        });

        it("creates underscore rule", () => {
            expect(md.horizontal("_")).toBe("___");
        });
    });

    describe("escape", () => {
        it("escapes special characters", () => {
            expect(md.escape("[link]")).toBe("\\[link\\]");
            expect(md.escape("*bold*")).toBe("\\*bold\\*");
        });
    });
});
