import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import md from "../../mappers/default_mode/smark.md.js";
import { removeWhiteSpaces, removeNewline } from "../../helpers/removeChar.js";

describe("Transpiling -> [MD]: Blocks & Inline", () => {
    it("returns raw block content", () => {
        let output = new SomMark({ src: "[Block]\nHello\n[end]", format: "md" }).transpile();
        output = removeNewline(output);
        expect(output).toBe("Hello");
    });

    it("returns h1 markdown", () => {
        let output = new SomMark({ src: "[Block]\n(SomMark)->(h1)[end]", format: "md" }).transpile();
        output = removeNewline(output);
        expect(output).toBe("# SomMark");
    });

    it("returns h3 markdown", () => {
        let output = new SomMark({ src: "[Block]\n(Title)->(h3)[end]", format: "md" }).transpile();
        output = removeNewline(output);
        expect(output).toBe("### Title");
    });

    it("returns bold markdown", () => {
        let output = new SomMark({ src: "[Block]\n(SomMark)->(bold)[end]", format: "md" }).transpile();
        output = removeNewline(output);
        expect(output).toBe("**SomMark**");
    });

    it("returns italic markdown", () => {
        let output = new SomMark({ src: "[Block]\n(SomMark)->(italic)[end]", format: "md" }).transpile();
        output = removeNewline(output);
        expect(output).toBe("*SomMark*");
    });

    it("returns emphasis (bold+italic) markdown", () => {
        let output = new SomMark({ src: "[Block]\n(SomMark)->(emphasis)[end]", format: "md" }).transpile();
        output = removeNewline(output);
        expect(output).toBe("***SomMark***");
    });

    it("returns inline code markdown", () => {
        md.create("inlinecode", ({ content }) => {
            return `\`${content}\``;
        });
        let output = new SomMark({ src: "[Block]\n(SomMark)->(inlinecode)[end]", format: "md" }).transpile();
        output = removeNewline(output);
        expect(output).toBe("`SomMark`");
    });

    it("returns code block with language", () => {
        let output = new SomMark({ src: "[Block]\n@_code_@: js\nsommark\n@_end_@\n[end]", format: "md" }).transpile();
        console.log("OUTPUT:", output);
        output = removeWhiteSpaces(output);
        expect(output).toBe("```jssommark```");
    });

    it("returns link markdown with title", () => {
        let output = new SomMark({
            src: '[Block]\n(My Site)->(link:https://example.com "Title")\n[end]',
            format: "md",
            includeDocument: false
        }).transpile();
        output = removeNewline(output.trim());
        expect(output).toBe('[My Site](https://example.com "Title")');
    });

    it("returns image markdown with alt and title", () => {
        let output = new SomMark({
            src: '[Block]\n(Alt Text)->(image:https://example.com/img.png "ImgTitle")[end]',
            format: "md",
            includeDocument: false
        }).transpile();
        output = removeNewline(output.trim());
        expect(output).toBe('![Alt Text](https://example.com/img.png "ImgTitle")');
    });
});

describe("Transpiling -> [MD]: Lists and Tables", () => {
    it("returns nested list markdown", () => {
        let output = new SomMark({
            src: "[Block]\n@_List_@\n- Item 1\n   - Sub-Item 1\n  - Sub-Item 2\n- Item 2\n@_end_@\n[end]",
            format: "md",
            includeDocument: false
        }).transpile();
        const expected = `- Item 1 - Sub-Item 1 - Sub-Item 2 - Item 2`;
        expect(removeWhiteSpaces(output)).toBe(removeWhiteSpaces(expected));
    });

    it("returns table markdown", () => {
        let output = new SomMark({
            src: "[Block]\n@_table_@:Name, Age\nJohn, 30\nJane, 25\n@_end_@\n[end]",
            format: "md",
            includeDocument: false
        }).transpile();
        output = removeNewline(output);
        console.log("TABLE OUTPUT:", output);
        expect(output.includes("| Name | Age |")).toBe(true);
        expect(output.includes("|------|-----|")).toBe(true);
        expect(output.includes("| John | 30 |")).toBe(true);
    });
});


describe("Mapper - parseList & list", () => {
    it("parseList returns nested structure", () => {
        const data = "- Item 1\n  - Sub-Item 1\n  - Sub-Item 2\n- Item 2";
        const result = md.parseList(data);
        expect(result).toEqual([
            {
                text: "Item 1",
                children: [
                    { text: "Sub-Item 1", children: [] },
                    { text: "Sub-Item 2", children: [] }
                ]
            },
            { text: "Item 2", children: [] }
        ]);
    });
});

describe("Mapper - create validation and render wrapper", () => {
    it("create throws when id or renderOutput missing", () => {
        expect(() => md.create(null, () => { })).toThrow("Expected arguments are not defined");
        expect(() => md.create("X")).toThrow("Expected arguments are not defined");
    });

    it("create throws when id is wrong type", () => {
        expect(() => md.create(123, () => { })).toThrow("argument 'id' expected to be a string or array");
    });

    it("create throws when renderOutput is not a function", () => {
        expect(() => md.create("X", "notfn")).toThrow("argument 'renderOutput' expected to be a function");
    });

    it("created render enforces data shape and returns output for valid data", () => {
        md.create("TestRender", ({ args, content }) => {
            return content;
        });
        const out = md.outputs.find(o => o.id === "TestRender");
        expect(typeof out.render).toBe("function");
        expect(() => out.render(null)).toThrow("render expects an object with properties { args, content }");
        expect(() => out.render({})).toThrow("render expects an object with properties { args, content }");
        expect(out.render({ args: [], content: "Hello" })).toBe("Hello");
    });
});