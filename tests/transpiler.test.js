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
