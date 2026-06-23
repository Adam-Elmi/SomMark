import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import SomMark from "../../index.js";

describe("SomMark Prefix Layers (Context Logic)", () => {
	const placeholder = {
		name: "Adam",
		site: "SomMark",
		v: "4.1"
	};

	const options = {
		format: "html",
		placeholders: placeholder
	};

	beforeAll(() => {
		// Create temporary component file to test variable scoping and privacy
		fs.writeFileSync("./Title.smark", "[h1] v{text} [end]", "utf-8");
	});

	afterAll(() => {
		// Clean up temporary component file
		if (fs.existsSync("./Title.smark")) {
			fs.unlinkSync("./Title.smark");
		}
	});

	describe("1. p{} Placeholders", () => {
		it("resolves global placeholders at top-level text structures", async () => {
			const src = "Welcome to p{site} vp{v}!";
			const sm = new SomMark({ ...options, src });
			const output = await sm.transpile();
			expect(output).toBe("Welcome to SomMark v4.1!");
		});

		it("resolves global placeholders inside nested block bodies", async () => {
			const src = "[div]Welcome to p{site}![end]";
			const sm = new SomMark({ ...options, src });
			const output = await sm.transpile();
			expect(output).toBe("<div>Welcome to SomMark!</div>");
		});

		it("resolves unquoted placeholder attributes inside block headers", async () => {
			const src = "[a = href: p{site}]Link[end]";
			const sm = new SomMark({ ...options, src });
			const output = await sm.transpile();
			expect(output).toBe('<a href="SomMark">Link</a>');
		});

		it("resolves quoted interpolated placeholder attributes inside block headers", async () => {
			const src = "[a = href: \"https://p{site}.org\"]Link[end]";
			const sm = new SomMark({ ...options, src });
			const output = await sm.transpile();
			expect(output).toBe('<a href="https://SomMark.org">Link</a>');
		});

		it("supports native numbers and booleans safety resolution without crashing", async () => {
			const src = "[div = style: p{width}]p{msg}: p{active}[end]";
			const sm = new SomMark({
				format: "html",
				src,
				placeholders: {
					width: 100,
					msg: "Status",
					active: true
				}
			});
			const output = await sm.transpile();
			expect(output).toBe('<div style="100;">\nStatus: true\n</div>');
		});

		it("preserves missing global placeholders in standard safety envelope formats", async () => {
			const src = "Hello p{unresolvedKey}!";
			const sm = new SomMark({ ...options, src });
			const output = await sm.transpile();
			expect(output).toBe("Hello SOMMARK_UNRESOLVED_p_unresolvedKey_SOMMARK!");
		});
	});

	describe("2. v{} Variable Layer & Modules Scoping Privacy", () => {
		it("resolves local component variables inside imported modular layouts", async () => {
			const src = `
			[import = Title: "./Title.smark"][end]
			[Title = text: "Local Title" !]
			`.trim();
			const sm = new SomMark({ ...options, src });
			const output = await sm.transpile();
			expect(output).toBe("<h1>\n Local Title \n</h1>");
		});

		it("enforces automatic scoping privacy isolating consumed variables and appending unused arguments", async () => {
			const src = `
			[import = Title: "./Title.smark"][end]
			[Title = id: "main-title", class: "header", text: "Welcome Content" !]
			`.trim();
			const sm = new SomMark({ ...options, src });
			const output = await sm.transpile();
			// Consumed parameter "text" is isolated and removed from root block h1
			// Unused parameters "id" and "class" cascade onto the root block h1
			expect(output).toBe('<h1 id="main-title" class="header">\n Welcome Content \n</h1>');
		});

		it("resolves missing local variables to high-visibility safety envelopes", async () => {
			const src = `
			[import = Title: "./Title.smark"][end]
			[Title = id: "main-title" !]
			`.trim();
			const sm = new SomMark({ ...options, src });
			const output = await sm.transpile();
			expect(output).toBe('<h1 id="main-title">\n SOMMARK_UNRESOLVED_v_text_SOMMARK \n</h1>');
		});
	});
});
