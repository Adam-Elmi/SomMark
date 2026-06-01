import { describe, it, expect } from "vitest";
import SomMark, { Mapper } from "../../index.js";

describe("Validator & Structural Validation Errors", () => {

	describe("Reserved Keywords Structural Safeguards", () => {
		it("should reject 'import' keyword used as an At-Block", async () => {
			const sm = new SomMark({
				src: "@_import_@; raw content @_end_@",
				format: "html"
			});
			await expect(sm.transpile()).rejects.toThrow(/Reserved keyword 'import' is strictly defined as a \[Block\] structure node/);
		});

		it("should reject 'import' keyword used as an Inline Statement", async () => {
			const sm = new SomMark({
				src: "(Text)->(import)",
				format: "html"
			});
			await expect(sm.transpile()).rejects.toThrow(/Reserved keyword 'import' is strictly defined as a \[Block\] structure node/);
		});

		it("should reject '$use-module' keyword used as an At-Block", async () => {
			const sm = new SomMark({
				src: "@_$use-module_@; module @_end_@",
				format: "html"
			});
			await expect(sm.transpile()).rejects.toThrow(/Reserved keyword '\$use-module' is strictly defined as a \[Block\]/);
		});

		it("should reject 'slot' keyword used as an At-Block", async () => {
			const sm = new SomMark({
				src: "@_slot_@; content @_end_@",
				format: "html"
			});
			await expect(sm.transpile()).rejects.toThrow(/Reserved keyword 'slot' is strictly defined as a \[Block\]/);
		});
	});

	describe("Custom Tags Structural Type Validation", () => {
		it("should reject block-only custom tags invoked as inline nodes", async () => {
			const mapper = new Mapper();
			mapper.register("container", () => "<div></div>", { type: "Block" });
			
			const sm = new SomMark({
				src: "(Content)->(container)",
				format: "html",
				mapperFile: mapper
			});
			await expect(sm.transpile()).rejects.toThrow(/is defined as type\(s\) \[Block\], but was used as a \[Inline\] structure node/);
		});

		it("should reject inline-only custom tags invoked as block nodes", async () => {
			const mapper = new Mapper();
			mapper.register("bold", ({ content }) => `<b>${content}</b>`, { type: "Inline" });
			
			const sm = new SomMark({
				src: "[bold]content[end]",
				format: "html",
				mapperFile: mapper
			});
			await expect(sm.transpile()).rejects.toThrow(/is defined as type\(s\) \[Inline\], but was used as a \[Block\] structure node/);
		});

		it("should reject multi-type custom tags when used as unmatched structures", async () => {
			const mapper = new Mapper();
			mapper.register("flexible", () => "", { type: ["Block", "Inline"] });
			
			const sm = new SomMark({
				src: "@_flexible_@; raw content @_end_@",
				format: "html",
				mapperFile: mapper
			});
			await expect(sm.transpile()).rejects.toThrow(/is defined as type\(s\) \[Block, Inline\], but was used as a \[AtBlock\] structure node/);
		});

		it("should bypass structural validation if allowed type contains wildcard 'any'", async () => {
			const mapper = new Mapper();
			mapper.register("wild", () => "wildcard", { type: ["any"] });
			
			const sm1 = new SomMark({ src: "[wild][end]", format: "html", mapperFile: mapper });
			const sm2 = new SomMark({ src: "(Content)->(wild)", format: "html", mapperFile: mapper });
			const sm3 = new SomMark({ src: "@_wild_@; content @_end_@", format: "html", mapperFile: mapper });

			await expect(sm1.transpile()).resolves.toBeDefined();
			await expect(sm2.transpile()).resolves.toBeDefined();
			await expect(sm3.transpile()).resolves.toBeDefined();
		});
	});

	describe("Empty-Body Constraints (Self-Closing Blocks)", () => {
		it("should reject empty-body blocks containing text elements", async () => {
			const mapper = new Mapper();
			mapper.register("img", () => "<img />", {
				type: "Block",
				rules: { is_empty_body: true }
			});

			const sm = new SomMark({
				src: "[img]Some non-empty text content[end]",
				format: "html",
				mapperFile: mapper
			});
			await expect(sm.transpile()).rejects.toThrow(/is defined as an empty-body component and cannot have children/);
		});

		it("should reject empty-body blocks containing child blocks", async () => {
			const mapper = new Mapper();
			mapper.register("br", () => "<br />", {
				type: "Block",
				rules: { is_self_closing: true }
			});

			const sm = new SomMark({
				src: "[br][div]nested[end][end]",
				format: "html",
				mapperFile: mapper
			});
			await expect(sm.transpile()).rejects.toThrow(/is defined as an empty-body component and cannot have children/);
		});

		it("should pass empty-body blocks with whitespace-only layouts", async () => {
			const mapper = new Mapper();
			mapper.register("spacer", () => "<div class='space'></div>", {
				type: "Block",
				rules: { is_empty_body: true }
			});

			const sm = new SomMark({
				src: "[spacer]   \n   [end]",
				format: "html",
				mapperFile: mapper
			});
			await expect(sm.transpile()).resolves.toBeDefined();
		});
	});

	describe("Required Arguments Constraints", () => {
		it("should reject tag compilations missing required named parameters", async () => {
			const mapper = new Mapper();
			mapper.register("image", () => "<img />", {
				type: "Block",
				rules: { required_args: ["src", "alt"] }
			});

			const sm = new SomMark({
				src: "[image = src: 'pic.jpg'][end]", // missing 'alt'
				format: "html",
				mapperFile: mapper
			});
			await expect(sm.transpile()).rejects.toThrow(/is missing required arguments: alt/);
		});

		it("should accept block compilations providing all required named parameters", async () => {
			const mapper = new Mapper();
			mapper.register("link", ({ args }) => `<a href="${args.href}">${args.text}</a>`, {
				type: "Block",
				rules: { required_args: ["href", "text"] }
			});

			const sm = new SomMark({
				src: "[link = href: 'site.com', text: 'Click Here'][end]",
				format: "html",
				mapperFile: mapper
			});
			const output = await sm.transpile();
			expect(output).toBe('<a href="site.com">Click Here</a>');
		});

		it("should validate required positional parameters", async () => {
			const mapper = new Mapper();
			mapper.register("quote", () => "", {
				type: "Block",
				rules: { required_args: [0] } // positional index 0 required
			});

			const sm = new SomMark({
				src: "[quote][end]", // missing positional 0
				format: "html",
				mapperFile: mapper
			});
			await expect(sm.transpile()).rejects.toThrow(/is missing required arguments: 0/);
		});
	});
});
