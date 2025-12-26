import { describe, it, expect } from "vitest";
import SomMark from "../index.js";

const src = "[Block]\nTest\n[end]";
describe("SomMark undefined format", () => {
	it("throws on undefined format", () => {
		expect(() => {
			new SomMark({ src });
		}).toThrow(/Undefined Format/);
	});
});

describe("SomMark format validation", () => {
	it("throws on unsupported format", () => {
		expect(() => {
			new SomMark({ src, format: "pdf" });
		}).toThrow(/Unknown Format/);
	});
});

describe("Transpiler: Expected to be <p>Test</p>", () => {
	it("returns <p>Test</p>", () => {
		const output = new SomMark({ src, format: "html", includeDocument: false }).transpile().trim();
		expect(output).toBe("<p>Test</p>");
	});
});

describe("Transpiler: Expected to be <section><p>Test</p></section>", () => {
	it("returns <section><p>Test</p></section>", () => {
		const output = new SomMark({ src: "[Section]\nTest\n[end]", format: "html", includeDocument: false })
			.transpile()
			.split("")
			.filter(value => !/\s/.test(value))
			.join("");
		expect(output).toBe("<section><p>Test</p></section>");
	});
});
