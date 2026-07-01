import { describe, it, expect } from "vitest";
import SomMark from "../../../index.js";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";

const smSettings = (src, options = {}) => ({
	src,
	format: "markdown",
	...options
});

describe("SomMark Markdown Mapper Comprehensive Test Suite", () => {
	/**
	 * Helper to validate that a string is valid Markdown/GFM syntax.
	 * Attempts to parse the Markdown using remark-gfm; throws on compatibility errors.
	 */
	const validateMarkdown = async (output) => {
		try {
			await remark()
				.use(remarkParse)
				.use(remarkGfm)
				.process(output);
			return true;
		} catch (err) {
			console.error("Markdown Compatibility Error:", err.message);
			console.error("Offending Output:\n", output);
			throw err;
		}
	};

	describe("Step 1: Inline Formatting", () => {
		it("renders bold templates correctly", async () => {
			const sm = new SomMark(smSettings("[b]Bold text[end]"));
			const output = await sm.transpile();
			expect(output).toBe("**Bold text**");
			await validateMarkdown(output);
		});

		it("renders italic templates correctly", async () => {
			const sm = new SomMark(smSettings("[i]Italic text[end]"));
			const output = await sm.transpile();
			expect(output).toBe("*Italic text*");
			await validateMarkdown(output);
		});

		it("renders emphasis (bold-italic) templates correctly", async () => {
			const sm = new SomMark(smSettings("[em]Emphasis text[end]"));
			const output = await sm.transpile();
			expect(output).toBe("***Emphasis text***");
			await validateMarkdown(output);
		});

		it("renders strike templates correctly", async () => {
			const sm = new SomMark(smSettings("[s]Strike text[end]"));
			const output = await sm.transpile();
			expect(output).toBe("~~Strike text~~");
			await validateMarkdown(output);
		});

		it("renders inline code statements correctly", async () => {
			const sm = new SomMark(smSettings('Use [code = "the code" !]'));
			const output = await sm.transpile();
			expect(output).toBe("Use `the code`");
			await validateMarkdown(output);
		});
	});

	describe("Step 2: Block Elements & Headings", () => {
		it("renders blockquotes cleanly in Markdown output", async () => {
			const sm = new SomMark(smSettings("[quote]Quote text[end]"));
			const output = await sm.transpile();
			expect(output).toBe("> Quote text");
			await validateMarkdown(output);
		});

		it("renders GFM alerts with custom type metadata", async () => {
			const sm = new SomMark(smSettings('[quote = type: "NOTE"]Alert note[end]'));
			const output = await sm.transpile();
			expect(output).toBe("> [!NOTE]\n> Alert note");
			await validateMarkdown(output);
		});

		it("renders thematic breaks hr correctly", async () => {
			const smDefault = new SomMark(smSettings("[hr][end]"));
			const smCustom = new SomMark(smSettings("[hr = '*'][end]"));

			const outDefault = await smDefault.transpile();
			const outCustom = await smCustom.transpile();

			expect(outDefault).toBe("---");
			expect(outCustom).toBe("***");

			await validateMarkdown(outDefault);
			await validateMarkdown(outCustom);
		});

		it("renders block headings H1-H6 in Markdown style", async () => {
			const sm1 = new SomMark(smSettings("[h1]H1 Title[end]"));
			const sm6 = new SomMark(smSettings("[h6]H6 Title[end]"));

			const out1 = await sm1.transpile();
			const out6 = await sm6.transpile();

			expect(out1).toBe("# H1 Title");
			expect(out6).toBe("###### H6 Title");

			await validateMarkdown(out1);
			await validateMarkdown(out6);
		});

		it("falls back to HTML formatted headings if format is html", async () => {
			const sm = new SomMark(smSettings('[h1 = format: "html"]Title[end]'));
			const output = await sm.transpile();
			expect(output).toBe("<h1>Title</h1>");
			await validateMarkdown(output);
		});

		it("renders explicitly closed HTML formatted headings correctly", async () => {
			const sm = new SomMark(smSettings('[h1 = format: "html", class: "title" !]'));
			const output = await sm.transpile();
			expect(output).toBe('<h1 class="title" />');
			await validateMarkdown(output);
		});

		it("renders todo status list items successfully", async () => {
			const sm = new SomMark(smSettings('[todo = status: "x"]Complete task[end]'));
			const output = await sm.transpile();
			expect(output).toBe("- [x] Complete task");
			await validateMarkdown(output);
		});
	});

	describe("Step 3: AST-Based Structural Components", () => {
		it("resolves full native AST tables cleanly", async () => {
			const src = `
[Table]
	[header]
		[row]
			[cell]Name[end]
			[cell]Role[end]
		[end]
	[end]
	[body]
		[row]
			[cell]Adam[end]
			[cell]Creator[end]
		[end]
	[end]
[end]
			`.trim();

			const sm = new SomMark(smSettings(src));
			const output = await sm.transpile();

			expect(output).toContain("| Name | Role |");
			expect(output).toContain("| --- | --- |");
			expect(output).toContain("| Adam | Creator |");
			await validateMarkdown(output);
		});

		it("resolves native AST unordered lists with custom bullets", async () => {
			const src = `
[list]
	[item]Bullet One[end]
	[item]Bullet Two[end]
[end]
			`.trim();

			const sm = new SomMark(smSettings(src));
			const output = await sm.transpile();
			expect(output).toBe("- Bullet One\n- Bullet Two");
			await validateMarkdown(output);
		});

		it("resolves native AST ordered lists", async () => {
			const src = `
[list = type: "number"]
	[item]First[end]
	[item]Second[end]
[end]
			`.trim();

			const sm = new SomMark(smSettings(src));
			const output = await sm.transpile();
			expect(output).toBe("1. First\n2. Second");
			await validateMarkdown(output);
		});

		it("handles nested lists recursively", async () => {
			const src = `
[list]
	[item]Parent Item
		[list]
			[item]Child Item[end]
		[end]
	[end]
[end]
			`.trim();

			const sm = new SomMark(smSettings(src));
			const output = await sm.transpile();
			expect(output).toBe("- Parent Item\n  \t\t- Child Item");
			await validateMarkdown(output);
		});
	});

	describe("Step 4: Media & Navigation", () => {
		it("renders link structures correctly", async () => {
			const sm = new SomMark(smSettings('[link = src: "https://example.com", title: "Tip"]Link text[end]'));
			const output = await sm.transpile();
			expect(output).toBe('[Link text](https://example.com "Tip")');
			await validateMarkdown(output);
		});

		it("renders image structures cleanly", async () => {
			const sm = new SomMark(smSettings('[image = alt: "Description", src: "image.png", title: "Tip"][end]'));
			const output = await sm.transpile();
			expect(output).toBe('![Description](image.png "Tip")');
			await validateMarkdown(output);
		});
	});

	describe("Step 5: Special Features & Shared Mappers", () => {
		it("renders fenced code block verbatim via smark-raw prop with custom mapper", async () => {
			const sm = new SomMark(smSettings("[fenced = smark-raw: true]```js\nconsole.log('hi');\n```[end]"));
			sm.register("fenced", ({ content }) => content);
			const output = await sm.transpile();
			expect(output).toBe("```js\nconsole.log('hi');\n```");
			await validateMarkdown(output);
		});

		it("falls back to compact HTML representation for single-child unknown tags", async () => {
			const sm = new SomMark(smSettings("[CustomTag]Tag Content[end]"));
			const output = await sm.transpile();
			expect(output).toBe("<CustomTag>Tag Content</CustomTag>");
			await validateMarkdown(output);
		});

		it("falls back to multiline HTML representation for multi-child unknown tags", async () => {
			const sm = new SomMark(smSettings("[CustomTag]\n[p]First[end][p]Second[end]\n[end]"));
			const output = await sm.transpile();
			expect(output).toBe("<CustomTag>\n<p>First</p><p>Second</p>\n</CustomTag>");
			await validateMarkdown(output);
		});

		it("supports void unknown tags self-closing representation", async () => {
			const sm = new SomMark(smSettings("[input = type: 'text' !]"));
			const output = await sm.transpile();
			expect(output).toBe('<input type="text" />');
			await validateMarkdown(output);
		});

		it("renders inline span with style prop correctly", async () => {
			const sm = new SomMark(smSettings("[span = style: 'color:blue']Colored[end]"));
			const output = await sm.transpile();
			expect(output).toBe('<span style="color:blue;">Colored</span>');
			await validateMarkdown(output);
		});
	});

	describe("Step 6: Escaping & Text Processing", () => {
		it("escapes HTML special characters inside text nodes", async () => {
			const sm = new SomMark(smSettings("Clean <escaping> & characters"));
			const output = await sm.transpile();
			expect(output).toBe("Clean &lt;escaping&gt; &amp; characters");
			await validateMarkdown(output);
		});

		it("applies smart Markdown escaping to protect special markers", async () => {
			const sm = new SomMark(smSettings("Protect *stars* and _underscores_"));
			const output = await sm.transpile();
			expect(output).toBe("Protect \\*stars\\* and \\_underscores\\_");
			await validateMarkdown(output);
		});

		it("supports literal escapes via [e] tag to prevent markdown rendering", async () => {
			const sm = new SomMark(smSettings("Literal [e]*[end] tag"));
			const output = await sm.transpile();
			expect(output).toBe("Literal \\* tag");
			await validateMarkdown(output);
		});
	});

	describe("Step 7: Static Logic Blocks", () => {
		it("evaluates server-side static logic blocks correctly inside Markdown templates", async () => {
			const sm = new SomMark(smSettings("static ${ 5 * 5 }$"));
			const output = await sm.transpile();
			expect(output).toBe("25");
			await validateMarkdown(output);
		});

		it("shares declared variables across multiple static blocks inside the same Markdown template", async () => {
			const src = `
static \${ let title = "MD Section"; }\$
[h1]static \${ title }\$[end]
			`.trim();
			const sm = new SomMark(smSettings(src));
			const output = await sm.transpile();
			expect(output).toContain("# MD Section");
			await validateMarkdown(output);
		});
	});
});
