import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import html from "../../mappers/default_mode/smark.html.js";
import { removeWhiteSpaces, removeNewline } from "../../helpers/removeChar.js";

// Block
describe("HTML Transpiler — Blocks", () => {
	html.create("Test", ({ args, content }) => {
		return html.tag("div").attributes({ title: args[0], "data-test-id": args[1], "data-failed-tests": args[2] }).body(content);
	});
	it("transpiles [Section] to <section><p>Test</p></section>", () => {
		let output = new SomMark({ src: "[Section]\nTest\n[end]", format: "html", includeDocument: false }).transpile();
		output = removeWhiteSpaces(output);
		expect(output).toBe("<section>Test</section>");
	});
	it("transpiles [Block] into plain text", () => {
		let output = new SomMark({ src: "[Block]Hello World[end]", format: "html", includeDocument: false }).transpile();
		output = removeNewline(output);
		expect(output).toBe("Hello World");
	});
	it("transpiles block with attributes to div", () => {
		const expectedValue =
			'<div title="Transpiler-Test" data-test-id="Test-101" data-failed-tests="5">Block Arguments</div>';
		let output = new SomMark({
			src: "[Test = Transpiler-Test, Test-101, 5 ]\nBlock Arguments\n[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeNewline(output);
		expect(output).toBe(expectedValue);
	});
	html.create("Container", ({ content }) => {
		return html
			.tag("div")
			.body(content);
	});
	it("transpiles nested Container blocks into nested divs", () => {
		const expectedValue = "<div><div><div><div><div><div>SomMark</div></div></div></div></div></div>";
		let output = new SomMark({
			src: "[Container]\n[Container]\n[Container]\n[Container]\n[Container]\n[Container]\nSomMark\n[end]\n[end]\n[end]\n[end]\n[end]\n[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeWhiteSpaces(output);
		expect(output).toBe(expectedValue);
	});
	it("transpiles block into image tag", () => {
		html.create("Image", ({ args, content }) => {
			return html
				.tag("img")
				.attributes({ src: args[0], alt: args[1] }).selfClose();
		});
		let output = new SomMark({
			src: "[Image = https://example.com/image.png, Example Image]\n[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeNewline(output);
		expect(output).toBe('<img src="https://example.com/image.png" alt="Example Image" />');
	});
});

// Inline
describe("HTML Transpiler — Inline statements", () => {
	it("transpiles bold inline to <strong>", () => {
		let inlineStatement_1 = new SomMark({
			src: "[Block]\n(SomMark)->(bold)[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		inlineStatement_1 = removeWhiteSpaces(inlineStatement_1);
		expect(inlineStatement_1).toBe("<strong>SomMark</strong>");
	});
	it("transpiles inline style to <span style=...>", () => {
		let inlineStatement_2 = new SomMark({
			src: "[Block]\n(SomMark)->(color:red)[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		inlineStatement_2 = removeNewline(inlineStatement_2);
		expect(inlineStatement_2).toBe('<span style="color:red">SomMark</span>');
	});
	it("transpiles inline link to <a href=... title=...>", () => {
		let inlineStatement_3 = new SomMark({
			src: '[Block]\n(My Site)->(link:https://example.com "Title")[end]',
			format: "html",
			includeDocument: false
		}).transpile();
		inlineStatement_3 = removeNewline(inlineStatement_3);
		expect(inlineStatement_3).toBe('<a href="https://example.com" title="Title">My Site</a>');
	});
});

// AtBlock
describe("HTML Transpiler — @-blocks", () => {
	it("transpiles @_List_@ to nested <ul> list", () => {
		let output = new SomMark({
			src: "[Block]\n@_List_@\n- Item 1\n   - Sub-Item 1\n  - Sub-Item 2\n-Item 2\n- Item 3\n@_end_@\n[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeNewline(output);
		expect(output).toBe("<ul><li>Item 1<ul><li>Sub-Item 1</li><li>Sub-Item 2</li></ul></li><li>Item 2</li><li>Item 3</li></ul>");
	});
	html.create("Text", ({ args, content }) => {
		return html
			.tag("p")
			.attributes({ style: `font-size:${args[0]}px`, title: args[1] })
			.body(content);
	});
	it("transpiles @_Text_@ to <p> with attributes", () => {
		let output = new SomMark({
			src: "[Block]\n@_Text_@:26, text\nThis is a test\n@_end_@\n[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeNewline(output);
		expect(output).toBe('<p style="font-size:26px" title="text">This is a test</p>');
	});
	it("transpiles @_table_@ to <table>", () => {
		let output = new SomMark({
			src: "[Block]\n@_table_@: user, role, status\n- Adam, Admin, active\n- Elmi, Developer, active\n- Eid, Tester, disabled\n@_end_@\n[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeNewline(output);
		expect(output).toBe(
			"<table class=\"sommark-table\"><thead><tr><th>user</th><th>role</th><th>status</th></tr></thead><tbody><tr><td>Adam</td><td>Admin</td><td>active</td></tr><tr><td>Elmi</td><td>Developer</td><td>active</td></tr><tr><td>Eid</td><td>Tester</td><td>disabled</td></tr></tbody></table>"
		);
	});
});