import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import Mapper from "../../mappers/mapper.js";
import HTML from "../../mappers/languages/html.js";

/**
 * Transpiler High-Fidelity Test Suite (Idiomatic Usage)
 * These tests verify the core orchestration logic in core/transpiler.js 
 * using the TagBuilder API as intended for mapper authors.
 */
describe("Transpiler Engine (core/transpiler.js)", () => {
	const format = "html";

	describe("1. Core Node Rendering & Formatting Helpers", () => {
		it("should render plain text with default escaping via mapper.text", async () => {
			const src = "Hello <World>";
			const sm = new SomMark({ src, format });
			// Default mapper text() doesn't escape unless overridden, 
			// but TagBuilder.body() DOES escape.
			sm.register("div", function({ content }) {
				return this.tag("div").body(content);
			});
			const result = await sm.transpile("[div]Hello <World>[end]");
			expect(result).toBe("<div>Hello &lt;World&gt;</div>");
		});

		it("should use mapper.comment for comments", async () => {
			const mapper = Mapper.define({
				comment: (text) => `<!-- ${text} -->`
			});
			const sm = new SomMark({ src: "# My Note", format, removeComments: false, mapperFile: mapper });
			const result = await sm.transpile();
			expect(result).toBe("<!-- My Note -->");
		});
	});

	describe("2. TagBuilder API Integration", () => {
		it("should support basic attributes and self-closing tags", async () => {
			const sm = new SomMark({ src: "[img = 'logo.png', alt: 'Logo'][end]", format });
			sm.register("img", function({ args }) {
				return this.tag("img")
					.attributes({ 
						// Positional arg 0 will be ignored by TagBuilder.attributes
						src: args[0], 
						alt: args.alt 
					})
					.selfClose();
			});
			const result = await sm.transpile();
			expect(result).toBe('<img src="logo.png" alt="Logo" />');
		});

		it("should support smartAttributes (Kebab-case & Styling Fallbacks)", async () => {
			const sm = new SomMark({ src: "[box = bgColor: 'red', marginTop: '10px']Content[end]", format });
			sm.register("box", function({ args, content }) {
				return this.tag("div")
					.smartAttributes(args)
					.body(content);
			});
			const result = await sm.transpile();
			// bgColor and marginTop are not native HTML props, so they fall back to style
			// Note: single quotes are stripped by the parser, so red is rendered as-is.
			expect(result).toBe('<div style="bg-color:red;margin-top:10px;">Content</div>');
		});

		it("should automatically wrap CSS variables in var()", async () => {
			// Using usage pattern (background: --main-bg) instead of declaration
			const sm = new SomMark({ src: "[div = style: 'background: --main-bg']Content[end]", format });
			sm.register("div", function({ args, content }) {
				return this.tag("div").attributes(args).body(content);
			});
			const result = await sm.transpile();
			// The TagBuilder automatically replaces --var with var(--var)
			expect(result).toBe('<div style="background: var(--main-bg)">Content</div>');
		});
	});

	describe("3. Resolution Strategies (L107-122)", () => {
		it("should support Lazy resolution (default) using placeholder injection", async () => {
			const sm = new SomMark({ src: "[parent][child]A[end][end]", format });
			sm.register("parent", function({ content }) {
				return this.tag("section").body(content);
			});
			sm.register("child", function({ content }) {
				return this.tag("article").body(content);
			});
			const result = await sm.transpile();
			expect(result).toBe("<section><article>A</article></section>");
		});

		it("should support Immediate resolution (resolve: true)", async () => {
			const sm = new SomMark({ src: "[parent]Raw[end]", format });
			sm.register("parent", function({ content }) {
				// 'content' is already resolved as 'Raw'
				return this.tag("div").body(content);
			}, { resolve: true });
			const result = await sm.transpile();
			expect(result).toBe("<div>Raw</div>");
		});

		it("should support Manual AST access (handleAst: true)", async () => {
			const sm = new SomMark({ src: "[custom]Data[end]", format });
			sm.register("custom", function({ ast }) {
				const text = ast.body[0].text;
				return `CUSTOM:${text}`;
			}, { handleAst: true });
			const result = await sm.transpile();
			expect(result).toBe("CUSTOM:Data");
		});
	});

	describe("4. Whitespace & Multi-child Orchestration", () => {
		it("should trigger isParentBlock wrapping for multiple children", async () => {
			const sm = new SomMark({ src: "[list][item]1[end][item]2[end][end]", format });
			sm.register("list", function({ content }) {
				return this.tag("ul").body(content);
			}, { trimAndWrapBlocks: true });
			sm.register("item", function({ content }) {
				return this.tag("li").body(content);
			});
			
			const result = await sm.transpile();
			// List has 2 children, so it triggers L104: \n + body + \n
			expect(result).toBe("<ul>\n<li>1</li><li>2</li>\n</ul>");
		});

		it("should respect target-level trimAndWrapBlocks: false override", async () => {
			const sm = new SomMark({ src: "[list][item]1[end][item]2[end][end]", format });
			sm.register("list", function({ content }) {
				return this.tag("ul").body(content);
			}, { trimAndWrapBlocks: false });
			sm.register("item", function({ content }) {
				return this.tag("li").body(content);
			});
			
			const result = await sm.transpile();
			// Overridden to false, so no wrapping newlines added by engine
			expect(result).toBe("<ul><li>1</li><li>2</li></ul>");
		});
	});

	describe("5. Edge Cases & Error Boundaries", () => {
		it("should gracefully handle missing placeholders by appending content", async () => {
			const sm = new SomMark({ src: "[div]Content[end]", format });
			sm.register("div", function({ content }) {
				// Mapper forgot to include {content} variable
				return "<div>Static</div>";
			});
			const result = await sm.transpile();
			// Engine appends content if placeholder is missing (L199)
			expect(result).toBe("<div>Static</div>Content");
		});

		it("should support unknown tag fallback via getUnknownTag", async () => {
			const mapper = Mapper.define({
				getUnknownTag: function(node) {
					return {
						render: ({ content }) => this.tag("span").attributes({ class: "err" }).body(content)
					};
				}
			});
			const sm = new SomMark({ src: "[Missing]Text[end]", format, mapperFile: mapper });
			const result = await sm.transpile();
			expect(result).toBe('<span class="err">Text</span>');
		});

		it("should support V4 Root block for CSS variable collection", async () => {
			const src = `
[Root = --theme-color: 'blue'][end]
[head]
 [title]Page[end]
[end]
[div = style: 'color: --theme-color']Text[end]
`.trim();
			
			const sm = new SomMark({ src, format, mapperFile: HTML });
			const result = await sm.transpile();
			
			// Should contain injected style block in head and wrapped variable usage in body
			expect(result).toContain('<style>:root { --theme-color:blue; }</style>');
			expect(result).toContain('<div style="color: var(--theme-color);">Text</div>');
		});
	});
});
