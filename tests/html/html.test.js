import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import html from "../../mappers/default_mode/smark.html.js";

function removeWhiteSpaces(text) {
	if (text) {
		return text
			.split("")
			.filter(char => !/\s/.test(char))
			.join("");
	}
}
function removeNewline(text) {
	if (text) {
		return text.split("\n").join("");
	}
}

/*
  Testig Blocks
*/
describe("Transpiling -> [HTML]: Testing Blocks", () => {
	html.create("Test", ({ args, content }) => {
		return html.tag("div").attributes({ title: args[0], "data-test-id": args[1], "data-failed-tests": args[2] }).body(content);
	});
	it("returns <section><p>Test</p></section>", () => {
		let output = new SomMark({ src: "[Section]\nTest\n[end]", format: "html", includeDocument: false }).transpile();
		output = removeWhiteSpaces(output);
		expect(output).toBe("<section><p>Test</p></section>");
	});
	it("returns <p>Hello</p><p>World</p>", () => {
		let output = new SomMark({ src: "[Block]\nHello\nWorld\n[end]", format: "html", includeDocument: false }).transpile();
		output = removeWhiteSpaces(output);
		expect(output).toBe("<p>Hello</p><p>World</p>");
	});
	it("It returns a block with its arguments", () => {
		const expectedValue =
			'<div title="Transpiler-Test" data-test-id="Test-101" data-failed-tests="5"><p>Block Arguments</p></div>';
		let output = new SomMark({
			src: "[Test = Transpiler-Test, Test-101, 5 ]\nBlock Arguments\n[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeNewline(output);
		expect(output).toBe(expectedValue);
	});
});
/*
  Testig Inline Statements
*/
describe("Transpiling -> [HTML] Testing Inline Statement", () => {
	it("returns strong tag", () => {
		let inlineStatement_1 = new SomMark({
			src: "[Block]\n(SomMark)->(bold)[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		inlineStatement_1 = removeWhiteSpaces(inlineStatement_1);
		expect(inlineStatement_1).toBe("<strong>SomMark</strong>");
	});
	it("returns span tag with style attribute", () => {
		let inlineStatement_2 = new SomMark({
			src: "[Block]\n(SomMark)->(color:red)[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		inlineStatement_2 = removeNewline(inlineStatement_2);
		expect(inlineStatement_2).toBe('<span style="color:red">SomMark</span>');
	});
	it("returns anchor tag with href and title attributes", () => {
		let inlineStatement_3 = new SomMark({
			src: '[Block]\n(My Site)->(link:https://example.com "Title")[end]',
			format: "html",
			includeDocument: false
		}).transpile();
		inlineStatement_3 = removeNewline(inlineStatement_3);
		expect(inlineStatement_3).toBe('<a href="https://example.com" title="Title">My Site</a>');
	});
});
/*
  Testig At Blocks
*/
describe("Transpiling -> [HTML] Testing At Blocks", () => {
	it("returns list elements", () => {
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
	it("returns p tag", () => {
		let output = new SomMark({
			src: "[Block]\n@_Text_@:26, text\nThis is a test\n@_end_@\n[end]",
			format: "html",
			includeDocument: false
		}).transpile();
		output = removeNewline(output);
		expect(output).toBe('<p style="font-size:26px" title="text">This is a test</p>');
	});
});
