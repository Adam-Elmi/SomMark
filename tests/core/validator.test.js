import { describe, it, expect } from "vitest";
import SomMark, { Mapper } from "../../index.js";

describe("Validator & Structural Validation Errors", () => {

	describe("Empty-Body Constraints (Self-Closing Blocks)", () => {
		it("should reject empty-body blocks containing text elements", async () => {
			const mapper = new Mapper();
			mapper.register("img", () => "<img />", {
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
				rules: { is_empty_body: true }
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
			mapper.register("link", ({ props }) => `<a href="${props.href}">${props.text}</a>`, {
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
				rules: { required_args: [0] }
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
