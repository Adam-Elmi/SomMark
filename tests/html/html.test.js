import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import html from "../../mappers/languages/html.js";
import { removeWhiteSpaces, removeNewline } from "../../helpers/removeChar.js";

// ========================================================================== //
//  HTML Transpiler Tests                                                     //
// ========================================================================== //

// ========================================================================== //
//  Blocks                                                                    //
// ========================================================================== //
describe("HTML Transpiler — Blocks", () => {
	html.register("Test", ({ args, content }) => {
		return html.tag("div").attributes({ title: args[0], "data-test-id": args[1], "data-failed-tests": args[2] }).body(content);
	});
	it("transpiles [Section] to <section><p>Test</p></section>", async () => {
		let output = await new SomMark({ src: "[Section]Test[end]", format: "html", includeDocument: false }).transpile();
		output = removeWhiteSpaces(output);
		expect(output).toBe("<section>Test</section>");
	});
	it("transpiles [Block] into plain text", async () => {
		let output = await new SomMark({ src: "[Block]Hello World[end]", format: "html", includeDocument: false }).transpile();
		output = removeNewline(output);
		expect(output).toBe("Hello World");
	});
	it("transpiles block with attributes to div", async () => {
		const expectedValue = '<div title="Transpiler-Test" data-test-id="Test-101" data-failed-tests="5">Block Arguments</div>';
		let output = await new SomMark({
			src: "[Test = Transpiler-Test, Test-101, 5 ]Block Arguments[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeNewline(output);
		expect(output).toBe(expectedValue);
	});
	html.register("Container", ({ content }) => {
		return html.tag("div").body(content);
	});
	it("transpiles nested Container blocks into nested divs", async () => {
		const expectedValue = "<div><div><div><div><div><div>SomMark</div></div></div></div></div></div>";
		let output = await new SomMark({
			src: "[Container][Container][Container][Container][Container][Container]SomMark[end][end][end][end][end][end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeWhiteSpaces(output);
		expect(output).toBe(expectedValue);
	});
	it("transpiles block into image tag", async () => {
		html.register("Image", ({ args, content }) => {
			return html.tag("img").attributes({ src: args[0], alt: args[1] }).selfClose();
		});
		let output = await new SomMark({
			src: "[Image = www.example.com/image.png, Example Image][end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeNewline(output);
		expect(output).toBe('<img src="www.example.com/image.png" alt="Example Image" />');
	});
	it("handles escape characters", async () => {
		let output = await new SomMark({
			src: "[Block]Escaped \\[\\] chars[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeNewline(output);
		expect(output).toBe("Escaped [] chars");
	});
	it("handles key-value arguments", async () => {
		html.register("KVBlock", ({ args }) => {
			return html.tag("div").attributes({ "data-key": args.key1 }).body(args.key2);
		});
		let output = await new SomMark({
			src: "[KVBlock = key2: Content, key1: Value][end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeNewline(output);
		expect(output).toBe('<div data-key="Value">Content</div>');
	});
});

// ========================================================================== //
//  Inline Statements                                                         //
// ========================================================================== //
describe("HTML Transpiler — Inline statements", () => {
	it("transpiles bold inline to <strong>", async () => {
		let inlineStatement_1 = await new SomMark({
			src: "[Block](SomMark)->(bold)[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		inlineStatement_1 = removeWhiteSpaces(inlineStatement_1);
		expect(inlineStatement_1).toBe("<strong>SomMark</strong>");
	});
	it("transpiles inline style to <span style=...>", async () => {
		let inlineStatement_2 = await new SomMark({
			src: "[Block](SomMark)->(color:red)[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		inlineStatement_2 = removeNewline(inlineStatement_2);
		expect(inlineStatement_2).toBe('<span style="color:red">SomMark</span>');
	});
	it("transpiles inline link to <a href=... title=...>", async () => {
		let inlineStatement_3 = await new SomMark({
			src: "[Block](My Site)->(link:www.example.com, Title)[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		inlineStatement_3 = removeNewline(inlineStatement_3);
		expect(inlineStatement_3).toBe('<a href="www.example.com" title="Title" target="_blank">My Site</a>');
	});
});

// ========================================================================== //
//  At-Blocks                                                                 //
// ========================================================================== //
describe("HTML Transpiler — @-blocks", () => {
	it("transpiles @_List_@ to nested <ul> list", async () => {
		let output = await new SomMark({
			src: "[Block]@_List_@\nItem 1\n   Sub-Item 1\n  Sub-Item 2\nItem 2\nItem 3\n@_end_@[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeNewline(output);
		expect(output).toBe("<ul><li>Item 1<ul><li>Sub-Item 1</li><li>Sub-Item 2</li></ul></li><li>Item 2</li><li>Item 3</li></ul>");
	});
	html.register("Text", ({ args, content }) => {
		return html
			.tag("p")
			.attributes({ style: `font-size:${args[0]}px`, title: args[1] })
			.body(content);
	});
	it("transpiles @_Text_@ to <p> with attributes", async () => {
		let output = await new SomMark({
			src: "[Block]@_Text_@:26, text;\nThis is a test\n@_end_@[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeNewline(output);
		expect(output).toBe('<p style="font-size:26px" title="text">This is a test</p>');
	});
	it("transpiles @_table_@ to <table>", async () => {
		let output = await new SomMark({
			src: "[Block]@_table_@: user, role, status;\nAdam, Admin, active\nElmi, Developer, active\nEid, Tester, disabled\n@_end_@[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeNewline(output);
		expect(output).toBe(
			'<table class="sommark-table"><thead><tr><th>user</th><th>role</th><th>status</th></tr></thead><tbody><tr><td>Adam</td><td>Admin</td><td>active</td></tr><tr><td>Elmi</td><td>Developer</td><td>active</td></tr><tr><td>Eid</td><td>Tester</td><td>disabled</td></tr></tbody></table>'
		);
	});
});
