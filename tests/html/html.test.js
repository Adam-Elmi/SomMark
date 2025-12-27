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

describe("Transpiling -> [HTML] Test simple block", () => {
	it("returns <section><p>Test</p></section>", () => {
		let output = new SomMark({ src: "[Section]\nTest\n[end]", format: "html", includeDocument: false }).transpile();
		output = removeWhiteSpaces(output);
		expect(output).toBe("<section><p>Test</p></section>");
	});
});

describe("Transpiling -> [HTML] Testing if text is wrapped by paragraph tag", () => {
	it("returns <p>Hello</p><p>World</p>", () => {
		let output = new SomMark({ src: "[Block]\nHello\nWorld\n[end]", format: "html", includeDocument: false }).transpile();
		output = removeWhiteSpaces(output);
		expect(output).toBe("<p>Hello</p><p>World</p>");
	});
});

html.create("Test", ({ args, content }) => {
	return html.tag("div").attributes({ title: args[0], "data-test-id": args[1], "data-failed-tests": args[2] }).body(content);
});
describe("Transpiling -> [HTML] Testing Block arguments", () => {
	const expectedValue = '<div title="Transpiler-Test" data-test-id="Test-101" data-failed-tests="5"><p>Block Arguments</p></div>';
	it("It returns a block with its arguments", () => {
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
	it("", () => {
		let output = new SomMark({ src: "[Block]\n(SomMark)->(bold)[end]", format: "html", includeDocument: false }).transpile();
		output = removeWhiteSpaces(output);
		expect(output).toBe('<strong>SomMark</strong>');
	});
});
describe("Transpiling -> [HTML] Testing Inline Statement", () => {
	it("returns span tag with style attribute", () => {
		let output = new SomMark({ src: "[Block]\n(SomMark)->(color:red)[end]", format: "html", includeDocument: false }).transpile();
		output = removeNewline(output);
		expect(output).toBe('<span style="color:red">SomMark</span>');
	});
});
describe("Transpiling -> [HTML] Testing Inline Statement", () => {
	it("returns span tag with style attribute", () => {
		let output = new SomMark({ src: '[Block]\n(My Site)->(link:https://example.com "Title")[end]', format: "html", includeDocument: false }).transpile();
		output = removeNewline(output);
		expect(output).toBe('<a href="https://example.com" title="Title">My Site</a>');
	});
});