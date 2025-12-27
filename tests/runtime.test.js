import { describe, it, expect } from "vitest";
import SomMark from "../index.js";

const src = "[Block]\nTest\n[end]";
describe("Testing Runtime Errors", () => {
	it("throws on undefined format", () => {
		expect(() => {
			new SomMark({ src });
		}).toThrow(/Undefined Format/);
	});
	it("throws on unsupported format", () => {
		expect(() => {
			new SomMark({ src, format: "pdf" });
		}).toThrow(/Unknown Format/);
	});
});

