import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import { htmlFormat } from "../../core/formats.js";

describe("Plugin: rules-validation", () => {
	const defaultOptions = { format: htmlFormat, includeDocument: false };

	it("validates argument count (min/max)", async () => {
		const sm = new SomMark(defaultOptions);
		sm.register("Limited", ({ content }) => content, {
			rules: { args: { min: 1, max: 2 } }
		});

		const srcFailMin = "[Limited]Content[end]";
		await expect(sm.transpile(srcFailMin)).rejects.toMatch(/requires.*at least.*1.*argument/);

		const srcFailMax = "[Limited = 1, 2, 3]Content[end]";
		await expect(sm.transpile(srcFailMax)).rejects.toMatch(/accepts.*at most.*2.*argument/);
		
		const srcPass = "[Limited = 1]Content[end]";
		const output = await sm.transpile(srcPass);
		expect(output.trim()).toBe("Content");
	});

	it("validates required argument keys", async () => {
		const sm = new SomMark(defaultOptions);
		sm.register("Required", ({ content }) => content, {
			rules: { args: { required: ["src"] } }
		});

		const srcFail = "[Required]Content[end]";
		await expect(sm.transpile(srcFail)).rejects.toMatch(/is.*missing.*required.*argument.*src/);
	});

	it("validates argument keys pattern (new rule)", async () => {
		const sm = new SomMark(defaultOptions);
		sm.register("Pattern", ({ content }) => content, {
			rules: { keys: /^data-/ }
		});

		const srcFail = "[Pattern = src: \"val\"]Content[end]";
		await expect(sm.transpile(srcFail)).rejects.toMatch(/contains.*argument.*keys.*match.*pattern/);
		
		const srcPass = "[Pattern = data-test: \"val\"]Content[end]";
		await expect(sm.transpile(srcPass)).resolves.toBeDefined();
	});

	it("validates argument values (regex and custom) (new rule)", async () => {
		const sm = new SomMark(defaultOptions);
		sm.register("Value", ({ content }) => content, {
			rules: { 
				values: { 
					age: /^\d+$/,
					email: (val) => val.includes("@")
				} 
			}
		});

		const srcFailRegex = "[Value = age: \"abc\"]Content[end]";
		await expect(sm.transpile(srcFailRegex)).rejects.toMatch(/has.*invalid.*value.*abc/);

		const srcFailCustom = "[Value = email: \"not-an-email\"]Content[end]";
		await expect(sm.transpile(srcFailCustom)).rejects.toMatch(/failed.*custom.*validation.*value/);
		
		const srcPass = "[Value = age: \"25\", email: \"test@example.com\"]Content[end]";
		await expect(sm.transpile(srcPass)).resolves.toBeDefined();
	});

	it("validates content length and pattern (new rule)", async () => {
		const sm = new SomMark(defaultOptions);
		sm.register("Div", ({ content }) => `<div>${content}</div>`);
		sm.register("IContent", ({ content }) => content, {
			type: "Inline",
			rules: { content: { maxLength: 5, match: /^[A-Z]+$/ } }
		});

		// Correct Inline syntax: (value)->(IContent)
		const srcFailLength = "[Div](TOOLONG)->(IContent)[end]";
		await expect(sm.transpile(srcFailLength)).rejects.toMatch(/content.*exceeds.*maximum.*length/);

		const srcFailMatch = "[Div](abc)->(IContent)[end]";
		await expect(sm.transpile(srcFailMatch)).rejects.toMatch(/content.*not.*match.*required.*pattern/);
		
		const srcPass = "[Div](HELLO)->(IContent)[end]";
		const output = await sm.transpile(srcPass);
		expect(output).toContain("HELLO");
	});

	it("validates self-closing content", async () => {
		const sm = new SomMark(defaultOptions);
		sm.register("Div", ({ content }) => `<div>${content}</div>`);
		sm.register("Self", () => "", {
			type: "AtBlock",
			rules: { is_self_closing: true }
		});

		// Correct AtBlock syntax: @_id_@ content @_end_@
		const srcFail = "[Div]@_Self_@; Illegal Content @_end_@[end]";
		await expect(sm.transpile(srcFail)).rejects.toMatch(/is.*self-closing.*not.*allowed.*content/);
	});

	it("validates identifier type (Block, Inline, AtBlock)", async () => {
		const sm = new SomMark(defaultOptions);
		sm.register("OnlyBlock", ({ content }) => content, {
			type: "Block"
		});

		const srcFail = "[Block](Value)->(OnlyBlock)[end]";
		await expect(sm.transpile(srcFail)).rejects.toMatch(/is.*expected.*to.*be.*type.*'Block'/);
		
		const srcPass = "[OnlyBlock]Content[end]";
		await expect(sm.transpile(srcPass)).resolves.toBeDefined();
	});
});
