import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import mdx from "../../mappers/default_mode/smark.mdx.js";
import { removeNewline } from "../../helpers/removeChar.js";

describe("SomMark MDX element/component tests (skip markdown)", () => {
    it("mdx.create should throw if called without id or renderOutput", () => {
        expect(() => mdx.create()).toThrow("Expected arguments are not defined");
    });

    it("render function for MDX", () => {
        mdx.create("MyComp", ({ content }) => mdx.tag("MyComp").body(content));
        const output = new SomMark({ src: "[MyComp]\nHello\n[end]", format: "mdx" }).transpile();
        expect(removeNewline(output)).toBe("<MyComp>Hello</MyComp>");
    });

    it("creates component markup with props and children", () => {
        mdx.create("Button", ({ args, content }) => mdx.tag("Button").attributes({ type: args[0] }).body(content));
        const output = new SomMark({ src: "[Button = primary]\nClick me\n[end]", format: "mdx" }).transpile();

        expect(removeNewline(output)).toContain("Click me");
        expect(removeNewline(output)).toContain("Button");
        expect(removeNewline(output)).toContain("primary");
    });

    it("creates self-closing component markup", () => {
        mdx.create("Image", ({ args }) => mdx.tag("Image").attributes({ src: args[0], alt: args[1] }).selfClose());
        const output = new SomMark({ src: "[Image = /path/to/image.jpg, Sample Image]\n[end]", format: "mdx" }).transpile();

        expect(removeNewline(output)).toBe('<Image src="/path/to/image.jpg" alt="Sample Image" />');
    });

    it("handles nested components", () => {
        mdx.create("Card", ({ content }) => mdx.tag("Card").body(content));
        mdx.create("Title", ({ content }) => mdx.tag("Title").body(content));

        const output = new SomMark({
            src: "[Card]\n[Title]\nMy Card Title\n[end]\nSome card content.\n[end]",
            format: "mdx",
        }).transpile();
        expect(removeNewline(output.replaceAll("  ", ""))).toBe("<Card><Title>My Card Title</Title>Some card content.</Card>");
    });

    it("handles components with no content", () => {
        mdx.create("Spacer", () => mdx.tag("Spacer").selfClose());
        const output = new SomMark({ src: "[Spacer]\n[end]", format: "mdx" }).transpile();

        expect(removeNewline(output)).toBe('<Spacer />');
    });

    it("props supports string and other types", () => {
        mdx.create("PropComp1", () =>
            mdx.tag("PropComp1").props([
                { type: "string", title: "Hello" },
                { type: "other", count: "items.length" }
            ]).body("Content")
        );
        const output = new SomMark({ src: "[PropComp1]\n[end]", format: "mdx" }).transpile();
        const out = removeNewline(output);
        expect(out).toContain('title="Hello"');
        expect(out).toContain('count={items.length}');
        expect(out).toContain("Content");
    });

    it("combines attributes() and props()", () => {
        mdx.create("PropComp2", () =>
            mdx.tag("PropComp2").attributes({ id: "x" }).props([{ type: "string", role: "admin" }]).selfClose()
        );
        const output = new SomMark({ src: "[PropComp2]\n[end]", format: "mdx" }).transpile();
        expect(removeNewline(output)).toBe('<PropComp2 id="x" role="admin" />');
    });

    it("throws when a prop item is invalid", () => {
        mdx.create("PropComp3", () =>
            mdx.tag("PropComp3").props(["bad"]).selfClose()
        );
        expect(() => new SomMark({ src: "[PropComp3]\n[end]", format: "mdx" }).transpile())
            .toThrow("prop expects an object with property { type }");
    });

    it("handles string props with empty value", () => {
        mdx.create("PropComp4", () =>
            mdx.tag("PropComp4").props([{ type: "string", empty: "" }]).selfClose()
        );
        const output = new SomMark({ src: "[PropComp4]\n[end]", format: "mdx" }).transpile();
        expect(removeNewline(output)).toBe('<PropComp4 empty="" />');
    });

    it("handles props with array values", () => {
        mdx.create("PropComp5", () =>
            mdx.tag("PropComp5").props([{ type: "other", items: "[1, 2, 3]" }]).selfClose()
        );
        const output = new SomMark({ src: "[PropComp5]\n[end]", format: "mdx" }).transpile();
        expect(removeNewline(output)).toBe('<PropComp5 items={[1, 2, 3]} />');
    });

    it("handles multiple attributes and props together", () => {
        mdx.create("PropComp6", () =>
            mdx.tag("PropComp6")
                .attributes({ class: "my-class", dataId: "123" })
                .props([{ type: "string", title: "Test" }, { type: "other", isActive: "true" }])
                .body("Content here")
        );
        const output = new SomMark({ src: "[PropComp6]\n[end]", format: "mdx" }).transpile();
        const out = removeNewline(output);
        expect(out).toContain('class="my-class"');
        expect(out).toContain('dataId="123"');
        expect(out).toContain('title="Test"');
        expect(out).toContain('isActive={true}');
        expect(out).toContain("Content here");
    });

    it("handles props with complex other values", () => {
        mdx.create("PropComp7", () =>
            mdx.tag("PropComp7").props([{ type: "other", config: "{ key: 'value', flag: true }" }]).selfClose()
        );
        const output = new SomMark({ src: "[PropComp7]\n[end]", format: "mdx" }).transpile();
        expect(removeNewline(output)).toBe('<PropComp7 config={{ key: \'value\', flag: true }} />');
    });

    it("handles props with function values", () => {
        mdx.create("PropComp8", () =>
            mdx.tag("PropComp8").props([{ type: "other", onClick: "() => alert('Clicked!')" }]).selfClose()
        );
        const output = new SomMark({ src: "[PropComp8]\n[end]", format: "mdx" }).transpile();
        expect(removeNewline(output)).toBe("<PropComp8 onClick={() => alert('Clicked!')} />");
    });

    it("handles props with method values", () => {
        mdx.create("PropComp9", () =>
            mdx.tag("PropComp9").props([{ type: "other", compute: "this.calculateValue()" }]).selfClose()
        );
        const output = new SomMark({ src: "[PropComp9]\n[end]", format: "mdx" }).transpile();
        expect(removeNewline(output)).toBe("<PropComp9 compute={this.calculateValue()} />");
    });

    it("handles props with long method chains", () => {
        mdx.create("PropComp10", () =>
            mdx.tag("PropComp10").props([{ type: "other", data: "this.getData().filter(x => x.active).map(x => x.value)" }]).selfClose()
        );
        const output = new SomMark({ src: "[PropComp10]\n[end]", format: "mdx" }).transpile();
        expect(removeNewline(output)).toBe("<PropComp10 data={this.getData().filter(x => x.active).map(x => x.value)} />");
    });

    it("handles props with nested object values", () => {
        mdx.create("PropComp11", () =>
            mdx.tag("PropComp11").props([{ type: "other", settings: "{ theme: 'dark', layout: { header: true, footer: false } }" }]).selfClose()
        );
        const output = new SomMark({ src: "[PropComp11]\n[end]", format: "mdx" }).transpile();
        expect(removeNewline(output)).toBe("<PropComp11 settings={{ theme: 'dark', layout: { header: true, footer: false } }} />");
    });

    it("mixed attributes and props with edge cases", () => {
        mdx.create("PropComp12", () =>
            mdx.tag("PropComp12")
                .attributes({ "data-empty": "", "data-number": 0 })
                .props([{ type: "string", description: "" }, { type: "other", isValid: "false" }])
                .body("Edge case content")
        );
        const output = new SomMark({ src: "[PropComp12]\n[end]", format: "mdx" }).transpile();
        const out = removeNewline(output);
        expect(out).toContain('data-empty=""');
        expect(out).toContain('data-number="0"');
        expect(out).toContain('description=""');
        expect(out).toContain('isValid={false}');
        expect(out).toContain("Edge case content");
    });
});     
