import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import md from "../../mappers/languages/markdown.js";
import { removeWhiteSpaces, removeNewline } from "../../helpers/removeChar.js";

// ========================================================================== //
//  Markdown Transpiler Tests                                                 //
// ========================================================================== //

// ========================================================================== //
//  Blocks & Inline                                                           //
// ========================================================================== //
describe("Transpiling -> [MD]: Blocks & Inline", () => {
    it("returns raw block content", async () => {
        let output = await new SomMark({ src: "[Block]Hello[end]", format: "markdown" }).transpile();
        output = removeNewline(output);
        expect(output).toBe("Hello");
    });

    it("returns h1 markdown", async () => {
        let output = await new SomMark({ src: "[Block](SomMark)->(h1)[end]", format: "markdown" }).transpile();
        output = removeNewline(output);
        expect(output).toBe("# SomMark");
    });

    it("returns h3 markdown", async () => {
        let output = await new SomMark({ src: "[Block](Title)->(h3)[end]", format: "markdown" }).transpile();
        output = removeNewline(output);
        expect(output).toBe("### Title");
    });

    it("returns bold markdown", async () => {
        let output = await new SomMark({ src: "[Block](SomMark)->(bold)[end]", format: "markdown" }).transpile();
        output = removeNewline(output);
        expect(output).toBe("**SomMark**");
    });

    it("returns italic markdown", async () => {
        let output = await new SomMark({ src: "[Block](SomMark)->(italic)[end]", format: "markdown" }).transpile();
        output = removeNewline(output);
        expect(output).toBe("*SomMark*");
    });

    it("returns emphasis (bold+italic) markdown", async () => {
        let output = await new SomMark({ src: "[Block](SomMark)->(emphasis)[end]", format: "markdown" }).transpile();
        output = removeNewline(output);
        expect(output).toBe("***SomMark***");
    });

    it("returns inline code markdown", async () => {
        md.register("inlinecode", ({ content }) => {
            return `\`${content}\``;
        });
        let output = await new SomMark({ src: "[Block](SomMark)->(inlinecode)[end]", format: "markdown" }).transpile();
        output = removeNewline(output);
        expect(output).toBe("`SomMark`");
    });

    it("returns code block with language", async () => {
        let output = await new SomMark({ src: "[Block]@_code_@: js;\nsommark\n@_end_@[end]", format: "markdown" }).transpile();
        output = removeWhiteSpaces(output);
        expect(output).toBe("```jssommark```");
    });

    it("returns link markdown with title", async () => {
        let output = await new SomMark({
            src: '[Block](My Site)->(link:www.example.com, Title)[end]',
            format: "markdown",
            includeDocument: false
        }).transpile();
        output = removeNewline(output.trim());
        expect(output).toBe('[My Site](www.example.com "Title")');
    });

    it("returns image markdown with alt and title", async () => {
        let output = await new SomMark({
            src: '[Block](Alt Text)->(image:www.example.com/img.png, ImgTitle)[end]',
            format: "markdown",
            includeDocument: false
        }).transpile();
        output = removeNewline(output.trim());
        expect(output).toBe('![Alt Text](www.example.com/img.png "ImgTitle")');
    });
    it("transpiles todo inline to [ ] Text", async () => {
        let output = await new SomMark({
            src: "[Block]([])->(todo: Release Version 2)[end]",
            format: "markdown",
            includeDocument: false
        }).transpile();
        output = removeNewline(output);
        expect(output).toBe("- [ ] Release Version 2");
    });
    it("handles escape characters", async () => {
        let output = await new SomMark({
            src: "[Block]Escaped \\[\\] chars[end]",
            format: "markdown",
            includeDocument: false
        }).transpile();
        output = removeNewline(output);
        expect(output).toBe("Escaped [] chars");
    });
    it("handles key-value arguments", async () => {
        md.register("KVBlock", ({ args }) => {
            return `${args.key1} - ${args.key2}`;
        });
        let output = await new SomMark({
            src: "[KVBlock = key2: World, key1: Hello][end]",
            format: "markdown",
            includeDocument: false
        }).transpile();
        output = removeNewline(output);
        expect(output).toBe("Hello - World");
    });
});

// ========================================================================== //
//  Lists and Tables                                                          //
// ========================================================================== //
describe("Transpiling -> [MD]: Lists and Tables", () => {
    it("returns nested list markdown", async () => {
        let output = await new SomMark({
            src: "[Block]@_List_@\nItem 1\n   Sub-Item 1\n  Sub-Item 2\nItem 2\n@_end_@[end]",
            format: "markdown",
            includeDocument: false
        }).transpile();
        const expected = `Item 1 Sub-Item 1 Sub-Item 2 Item 2`;
        expect(removeWhiteSpaces(output)).toBe(removeWhiteSpaces(expected));
    });

    it("returns table markdown", async () => {
        let output = await new SomMark({
            src: "[Block]@_table_@:Name, Age;\nJohn, 30\nJane, 25\n@_end_@[end]",
            format: "markdown",
            includeDocument: false
        }).transpile();
        output = removeNewline(output);
        expect(output.includes("| Name | Age |")).toBe(true);
        expect(output.includes("|------|-----|")).toBe(true);
        expect(output.includes("| John | 30 |")).toBe(true);
    });
});

// ========================================================================== //
//  Mapper Helpers                                                            //
// ========================================================================== //
describe("Mapper - parseList & list", () => {
    it("parseList returns nested structure", () => {
        const data = "Item 1\n  Sub-Item 1\n  Sub-Item 2\nItem 2";
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

// ========================================================================== //
//  Mapper Validation                                                         //
// ========================================================================== //
describe("Mapper - create validation and render wrapper", () => {
    it("create throws when id or renderOutput missing", () => {
        expect(() => md.register(null, () => { })).toThrow("Expected arguments are not defined");
        expect(() => md.register("X")).toThrow("Expected arguments are not defined");
    });

    it("create throws when id is wrong type", () => {
        expect(() => md.register(123, () => { })).toThrow("argument 'id' expected to be a string or array");
    });

    it("create throws when renderOutput is not a function", () => {
        expect(() => md.register("X", "notfn")).toThrow("argument 'renderOutput' expected to be a function");
    });

    it("created render enforces data shape and returns output for valid data", () => {
        md.register("TestRender", ({ args, content }) => {
            return content;
        });
        const out = md.outputs.find(o => o.id === "TestRender");
        expect(typeof out.render).toBe("function");
        expect(() => out.render(null)).toThrow("render expects an object with properties { args, content }");
        expect(() => out.render({})).toThrow("render expects an object with properties { args, content }");
        expect(out.render({ args: [], content: "Hello" })).toBe("Hello");
    });
});