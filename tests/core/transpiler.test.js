import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";
import Mapper from "../../mappers/mapper.js";
import HTML from "../../mappers/languages/html.js";

describe("Transpiler Engine (core/transpiler.js)", () => {
	const format = "html";

	describe("1. Core Node Rendering & Formatting Helpers", () => {
		it("renders plain text with escaping via custom mapper text formatting rules", async () => {
			const src = "[div]Hello <World>[end]";
			const sm = new SomMark({ src, format });
			sm.register("div", function ({ content }) {
				return this.tag("div").body(content);
			});
			const result = await sm.transpile();
			expect(result).toBe("<div>Hello &lt;World&gt;</div>");
		});

		it("formats and retains single-line and multiline comments when comment removal is disabled", async () => {
			const mapper = Mapper.define({
				comment: (text) => `<!-- ${text} -->`,
				commentBlock: (text) => `<!-- ${text} -->`
			});
			const sm = new SomMark({
				src: "# My Note\n###\nBlock comment\n###",
				format,
				removeComments: false,
				mapperFile: mapper
			});
			const result = await sm.transpile();
			expect(result).toBe("<!-- My Note -->\n <!-- Block comment -->");
		});

		it("omits comments completely and skips trailing newlines to prevent gaps when comment removal is enabled", async () => {
			const mapper = Mapper.define({
				comment: (text) => `<!-- ${text} -->`
			});
			const sm = new SomMark({
				src: "Before\n# My Note\n\nAfter",
				format,
				removeComments: true,
				mapperFile: mapper
			});
			const result = await sm.transpile();
			expect(result).toBe("Before\n\nAfter");
		});

		it("evaluates compile-time static logic blocks inside VM sandbox and renders results", async () => {
			const sm = new SomMark({ src: "Number: static ${ 10 * 5 }$", format });
			const result = await sm.transpile();
			expect(result).toBe("Number: 50");
		});

		it("preprocessed runtime logic blocks and delegates them to mapper runtimeLogic helper", async () => {
			const mapper = Mapper.define({
				runtimeLogic: (code) => `<script>${code}</script>`
			});
			const sm = new SomMark({ src: "runtime ${ console.log('test') }$", format, mapperFile: mapper });
			const result = await sm.transpile();
			expect(result).toBe("<script> console.log('test') </script>");
		});
	});

	describe("2. TagBuilder API Integration", () => {
		it("formats standard tag attributes using standard named arguments", async () => {
			const sm = new SomMark({ src: "[img = 'logo.png', alt: 'Website Logo'][end]", format });
			sm.register("img", function ({ args }) {
				return this.tag("img")
					.attributes({
						src: args[0],
						alt: args.alt
					})
					.selfClose();
			});
			const result = await sm.transpile();
			expect(result).toBe('<img src="logo.png" alt="Website Logo" />');
		});

		it("transforms camelCase properties into kebab-case styles using smartAttributes helper", async () => {
			const sm = new SomMark({ src: "[box = bgColor: 'blue', marginTop: '15px']Content[end]", format });
			sm.register("box", function ({ args, content }) {
				return this.tag("div")
					.smartAttributes(args)
					.body(content);
			});
			const result = await sm.transpile();
			expect(result).toBe('<div style="bg-color:blue;margin-top:15px;">Content</div>');
		});

		it("automatically wraps CSS custom properties in var() functional structures", async () => {
			const sm = new SomMark({ src: "[div = style: 'background: --accent-color']Content[end]", format });
			sm.register("div", function ({ args, content }) {
				return this.tag("div").attributes(args).body(content);
			});
			const result = await sm.transpile();
			expect(result).toBe('<div style="background: var(--accent-color)">Content</div>');
		});

		it("propagates parser-detected isSelfClosing boolean flag to target block render functions", async () => {
			const sm = new SomMark({ src: "[img = src: 'logo.png' !]", format });
			sm.register("img", function ({ args, isSelfClosing }) {
				const tag = this.tag("img").attributes(args);
				return isSelfClosing ? tag.selfClose() : tag.body("");
			});
			const result = await sm.transpile();
			expect(result).toBe('<img src="logo.png" />');
		});
	});

	describe("3. Resolution Strategies", () => {
		it("performs lazy resolution by resolving children dynamically using body placeholders", async () => {
			const sm = new SomMark({ src: "[parent][child]Child text[end][end]", format });
			sm.register("parent", function ({ content }) {
				return this.tag("div").attributes({ class: "parent" }).body(content);
			});
			sm.register("child", function ({ content }) {
				return this.tag("span").attributes({ class: "child" }).body(content);
			});
			const result = await sm.transpile();
			expect(result).toBe('<div class="parent"><span class="child">Child text</span></div>');
		});

		it("resolves inner block contents immediately before parent block renders when resolve option is set", async () => {
			const sm = new SomMark({ src: "[parent]Immediate content[end]", format });
			sm.register("parent", function ({ content }) {
				return this.tag("div").body(content);
			}, { resolve: true });
			const result = await sm.transpile();
			expect(result).toBe('<div>Immediate content</div>');
		});

		it("provides raw AST control for mappers when handleAst is activated", async () => {
			const sm = new SomMark({ src: "[custom]Raw body text[end]", format });
			sm.register("custom", function ({ ast }) {
				const text = ast.body[0].text;
				return `AST:${text}`;
			}, { handleAst: true });
			const result = await sm.transpile();
			expect(result).toBe('AST:Raw body text');
		});

		it("throws an access error when attempting to read AST properties if handleAst is inactive", async () => {
			const sm = new SomMark({ src: "[custom]Data[end]", format });
			sm.register("custom", function ({ ast }) {
				return ast.body;
			});
			await expect(sm.transpile()).rejects.toThrow(/Access Error/);
		});
	});

	describe("4. Whitespace, Multi-child & Loop", () => {
		it("inserts clean line breaks around child blocks of container tags when trimAndWrapBlocks is active", async () => {
			const sm = new SomMark({ src: "[list][item]First[end][item]Second[end][end]", format });
			sm.register("list", function ({ content }) {
				return this.tag("ul").body(content);
			}, { trimAndWrapBlocks: true });
			sm.register("item", function ({ content }) {
				return this.tag("li").body(content);
			});
			const result = await sm.transpile();
			expect(result).toBe('ul:\n<li>First</li><li>Second</li>\n</ul>'.replace('ul:', '<ul>'));
		});

		it("suppresses formatting line breaks when trimAndWrapBlocks is explicitly disabled", async () => {
			const sm = new SomMark({ src: "[list][item]First[end][item]Second[end][end]", format });
			sm.register("list", function ({ content }) {
				return this.tag("ul").body(content);
			}, { trimAndWrapBlocks: false });
			sm.register("item", function ({ content }) {
				return this.tag("li").body(content);
			});
			const result = await sm.transpile();
			expect(result).toBe('<ul><li>First</li><li>Second</li></ul>');
		});

		it("iterates over arrays inside loop blocks injecting item references and indexes", async () => {
			const sm = new SomMark({
				src: `[for-each = static \${ [ { name: "A" }, { name: "B" } ] }$, as: "user"]User: static \${ user.name }$, Index: static \${ user_index }$ [end]`,
				format
			});
			const result = await sm.transpile();
			expect(result).toBe("User: A, Index: 0User: B, Index: 1");
		});

		it("trims structural leading and trailing whitespace inside for-each block boundaries", async () => {
			const sm = new SomMark({
				src: `[for-each = static \${ ["First", "Second"] }$, as: "item"]\n\tstatic \${ item }$\n[end]`,
				format
			});
			const result = await sm.transpile();
			expect(result).toBe("FirstSecond");
		});
	});

	describe("5. Edge Cases & Error Boundaries", () => {
		it("safely appends content to target layouts if the mapper fails to include body placeholders", async () => {
			const sm = new SomMark({ src: "[div]Appended text[end]", format });
			sm.register("div", function ({ content }) {
				return "<div>Static content</div>";
			});
			const result = await sm.transpile();
			expect(result).toBe("<div>Static content</div>Appended text");
		});

		it("handles unregistered tags smoothly by redirecting output to getUnknownTag fallback", async () => {
			const mapper = Mapper.define({
				getUnknownTag: function (node) {
					return {
						render: ({ content }) => this.tag("span").attributes({ class: "fallback" }).body(content)
					};
				}
			});
			const sm = new SomMark({ src: "[MissingTag]Fallback text[end]", format, mapperFile: mapper });
			const result = await sm.transpile();
			expect(result).toBe('<span class="fallback">Fallback text</span>');
		});

		it("accumulates variables in Root and injects CSS style blocks dynamically into head tag", async () => {
			const src = `
[Root = --brand-color: "teal"][end]
[head]
 [title]Page[end]
[end]
[div = style: "color: --brand-color"]Content[end]
`.trim();
			const sm = new SomMark({ src, format, mapperFile: HTML });
			const result = await sm.transpile();
			expect(result).toContain('<style>:root { --brand-color:teal; }</style>');
			expect(result).toContain('<div style="color: var(--brand-color);">Content</div>');
		});

		it("supports static logic blocks returning custom raw values and enforces raw security configurations", async () => {
			// With raw values allowed (default)
			const smAllowed = new SomMark({
				src: "Raw: static \${ SomMark.raw('<b>Bold</b>') }$",
				format
			});
			const resultAllowed = await smAllowed.transpile();
			expect(resultAllowed).toBe("Raw: <b>Bold</b>");

			// With raw values disabled but returning raw object directly (escaped by transpiler)
			const smDisabled = new SomMark({
				src: "Raw: static \${ ({ __raw: '<b>Bold</b>' }) }$",
				format,
				security: { allowRaw: false }
			});
			const resultDisabled = await smDisabled.transpile();
			expect(resultDisabled).toBe("Raw: &lt;b&gt;Bold&lt;/b&gt;");

			// With raw values disabled and calling SomMark.raw (throws security error inside VM)
			const smError = new SomMark({
				src: "Raw: static \${ SomMark.raw('<b>Bold</b>') }$",
				format,
				security: { allowRaw: false }
			});
			await expect(smError.transpile()).rejects.toThrow(/Security Error/);
		});
	});

	describe("6. Scoped Compiler & Argument Naming Guards", () => {
		it("throws a Reserved Attribute Error if a user attempts to define a data-sommark attribute", async () => {
			const sm = new SomMark({ src: "[div = data-sommark-id: 'exploit']Content[end]", format });
			sm.register("div", function ({ args, content }) { return this.tag("div").attributes(args).body(content); });
			await expect(sm.transpile()).rejects.toThrow(/Reserved Attribute Error/);
		});

		it("generates a unique data-sommark-id attribute and replaces document.currentScript with querySelector in runtime logic", async () => {
			const src = `
[div]
  runtime \${ self.style.color = "red"; }\$
[end]
			`.trim();
			const sm = new SomMark({ src, format, mapperFile: HTML });
			const result = await sm.transpile();
			expect(result).toContain('data-sommark-id="sommark-div-');
			expect(result).toContain("const self = document.querySelector('[data-sommark-id=\"sommark-div-");
			expect(result).toContain("self.style.color = \"red\";");
		});

		it("does not pollute normal tags without runtime logic with a data-sommark-id attribute", async () => {
			const src = `[div]Normal Tag[end]`;
			const sm = new SomMark({ src, format, mapperFile: HTML });
			const result = await sm.transpile();
			expect(result).not.toContain("data-sommark-id");
		});

		it("generates completely different, unique secret IDs for each iteration in loops", async () => {
			const src = `
[for-each = static \${ ["one", "two"] }\$, as: "item"]
  [div]
    runtime \${ console.log("item"); }\$
  [end]
[end]
			`.trim();
			const sm = new SomMark({ src, format, mapperFile: HTML });
			const result = await sm.transpile();
			const matches = [...result.matchAll(/<[^>]+data-sommark-id="([^"]+)"/g)];
			expect(matches.length).toBe(2);
			expect(matches[0][1]).not.toBe(matches[1][1]);
		});

		it("hides runtime script tags but retains unique data-sommark-id attributes when hideRuntimeOutput is enabled", async () => {
			const src = `
[div]
  runtime \${ self.style.color = "blue"; }\$
  Hello
[end]
			`.trim();
			const sm = new SomMark({ src, format, mapperFile: HTML, hideRuntimeOutput: true });
			const result = await sm.transpile();
			expect(result).toContain('data-sommark-id="sommark-div-');
			expect(result).not.toContain("<script>");
			expect(result).toContain("Hello");
		});

		it("compiles and returns ONLY native scoped JS code blocks when generateRuntimeOutput is enabled", async () => {
			const src = `
[div]
  runtime \${ const x = "hello"; }\$
  Hello Layout
[end]
			`.trim();
			const sm = new SomMark({ src, format, mapperFile: HTML, generateRuntimeOutput: true });
			const result = await sm.transpile();
			expect(result).not.toContain("Hello Layout");
			expect(result).not.toContain("<div");
			expect(result).not.toContain("<script>");

			expect(result).toContain("const self = document.querySelector('[data-sommark-id=\"sommark-div-");
			expect(result).toContain('const x = "hello";');
		});
	});
});

