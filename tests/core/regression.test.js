import { describe, it, expect, beforeAll, afterAll } from "vitest";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import SomMark from "../../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, "temp_regression");

describe("SomMark Regression Tests (Issues #10–#17)", () => {
	beforeAll(() => {
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}
	});

	afterAll(() => {
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
	});

	// ─── Issue #10 ────────────────────────────────────────────────────────────
	// Concurrent transpile() calls crashed because the evaluator singleton was
	// shared across SomMark instances without isolation.

	describe("Issue #10: Concurrent transpile() calls", () => {
		it("two instances transpiled in parallel produce correct independent output", async () => {
			const sm1 = new SomMark({ src: "[h1]First Page[end]", format: "html" });
			const sm2 = new SomMark({ src: "[p]Second Page[end]", format: "html" });

			const [r1, r2] = await Promise.all([sm1.transpile(), sm2.transpile()]);

			expect(r1).toBe("<h1>First Page</h1>");
			expect(r2).toBe("<p>Second Page</p>");
		});

		it("many instances transpiled concurrently all resolve correctly", async () => {
			const sources = ["[span]A[end]", "[span]B[end]", "[span]C[end]", "[span]D[end]", "[span]E[end]"];
			const instances = sources.map((src) => new SomMark({ src, format: "html" }));

			const results = await Promise.all(instances.map((sm) => sm.transpile()));

			expect(results).toEqual([
				"<span>A</span>",
				"<span>B</span>",
				"<span>C</span>",
				"<span>D</span>",
				"<span>E</span>"
			]);
		});

		it("concurrent instances with static blocks each get isolated sandbox execution", async () => {
			const sm1 = new SomMark({ src: "static ${ 2 + 2 }$", format: "html" });
			const sm2 = new SomMark({ src: "static ${ 10 * 5 }$", format: "html" });
			const sm3 = new SomMark({ src: "static ${ 100 - 1 }$", format: "html" });

			const [r1, r2, r3] = await Promise.all([sm1.transpile(), sm2.transpile(), sm3.transpile()]);

			expect(r1).toBe("4");
			expect(r2).toBe("50");
			expect(r3).toBe("99");
		});
	});

	// ─── Issue #11 ────────────────────────────────────────────────────────────
	// Static blocks inside imported modules resolved import paths relative to
	// the main entry file, not the module's own file location.

	describe("Issue #11: Module static blocks resolve imports relative to the module file", () => {
		it("importing a sibling file inside a module's static block resolves correctly", async () => {
			const uiDir = path.join(tempDir, "ui11");
			fs.mkdirSync(uiDir, { recursive: true });

			fs.writeFileSync(path.join(uiDir, "style.css"), "body { margin: 0; }", "utf-8");
			fs.writeFileSync(
				path.join(uiDir, "Tokens.smark"),
				'[div]\nstatic ${ import css from "./style.css?raw"; return css; }$\n[end]',
				"utf-8"
			);

			const sm = new SomMark({
				src: '[import = Tokens: "./ui11/Tokens.smark"][end]\n[Tokens][end]',
				format: "html",
				baseDir: tempDir
			});
			const output = await sm.transpile();

			expect(output).toContain("body { margin: 0; }");
		});
	});

	// ─── Issue #12 ────────────────────────────────────────────────────────────
	// v{} placeholders embedded inside quoted prop strings (alongside other text)
	// were not being resolved — the surrounding text was left as-is.

	describe("Issue #12: v{} inside quoted prop strings resolves correctly", () => {
		it("resolves v{} embedded in a prop string when the value is passed as a component prop", async () => {
			const modDir = path.join(tempDir, "mod12");
			fs.mkdirSync(modDir, { recursive: true });
			fs.writeFileSync(
				path.join(modDir, "Button.smark"),
				'[button = class: "btn btn--v{variant}"][slot][end][end]',
				"utf-8"
			);

			const sm = new SomMark({
				src: '[import = Button: "./mod12/Button.smark"][end]\n[Button = variant: "danger"]Submit[end]',
				format: "html",
				baseDir: tempDir
			});
			const output = await sm.transpile();
			expect(output).toContain('class="btn btn--danger"');
		});
	});

	// ─── Issue #13 ────────────────────────────────────────────────────────────
	// v{key | "fallback"} in nested element body text was misinterpreted —
	// the prop was applied as a CSS style instead of resolving in the body.

	describe("Issue #13: v{key | 'fallback'} in nested element body text", () => {
		it("resolves a component prop used as body text with fallback syntax", async () => {
			const modDir = path.join(tempDir, "mod13");
			fs.mkdirSync(modDir, { recursive: true });
			fs.writeFileSync(
				path.join(modDir, "Row.smark"),
				'[div = class: "row"][span]v{title}[end][span]v{subtitle | "none"}[end][end]',
				"utf-8"
			);

			const sm = new SomMark({
				src: '[import = Row: "./mod13/Row.smark"][end]\n[Row = title: "Color Scheme", subtitle: "Light or dark" !]',
				format: "html",
				baseDir: tempDir
			});
			const output = await sm.transpile();

			expect(output).toContain("<span>Color Scheme</span>");
			expect(output).toContain("<span>Light or dark</span>");
			// The subtitle prop must not leak into HTML attributes as a style
			expect(output).not.toContain('style="subtitle');
			expect(output).not.toContain('subtitle=');
		});

		it("uses the fallback value when the optional prop is not passed", async () => {
			const modDir = path.join(tempDir, "mod13b");
			fs.mkdirSync(modDir, { recursive: true });
			fs.writeFileSync(
				path.join(modDir, "Row.smark"),
				'[div][span]v{subtitle | "none"}[end][end]',
				"utf-8"
			);

			const sm = new SomMark({
				src: '[import = Row: "./mod13b/Row.smark"][end]\n[Row !]',
				format: "html",
				baseDir: tempDir
			});
			const output = await sm.transpile();
			expect(output).toContain("<span>none</span>");
		});

		it("uses fallback when v{key | 'fallback'} placeholder is absent", async () => {
			const sm = new SomMark({
				src: '[span]v{label | "default"}[end]',
				format: "html",
				placeholders: {}
			});
			expect(await sm.transpile()).toBe("<span>default</span>");
		});
	});

	// ─── Issue #15 ────────────────────────────────────────────────────────────
	// Importing "./main.js" inside a static block returned the wrong value.
	// QuickJS stripped "./" making the resolved name "main.js", which matched
	// the internal eval module name and caused a silent circular self-import.

	describe("Issue #15: ./main.js import in static blocks returns the correct export", () => {
		it("importing a JS file with ./ prefix returns the exported value, not a module reference", async () => {
			const dir15 = path.join(tempDir, "issue15");
			fs.mkdirSync(dir15, { recursive: true });
			fs.writeFileSync(path.join(dir15, "main.js"), 'export const name = "Adam";', "utf-8");

			const sm = new SomMark({
				src: 'static ${ import { name } from "./main.js"; return name; }$',
				format: "html",
				filename: path.join(dir15, "index.smark")
			});
			const output = await sm.transpile();
			expect(output).toBe("Adam");
		});

		it("importing a differently named JS file still resolves correctly", async () => {
			const dir15b = path.join(tempDir, "issue15b");
			fs.mkdirSync(dir15b, { recursive: true });
			fs.writeFileSync(path.join(dir15b, "utils.js"), 'export const PI = 3.14;', "utf-8");

			const sm = new SomMark({
				src: 'static ${ import { PI } from "./utils.js"; return PI; }$',
				format: "html",
				filename: path.join(dir15b, "index.smark")
			});
			const output = await sm.transpile();
			expect(output).toBe("3.14");
		});
	});

	// ─── Issue #17 ────────────────────────────────────────────────────────────
	// The Markdown mapper lowercased unknown tag names before output, turning
	// [CustomTag] into <customtag> instead of the expected <CustomTag>.

	describe("Issue #17: Markdown mapper preserves casing of unknown tags", () => {
		it("preserves PascalCase unknown tag names in markdown output", async () => {
			const sm = new SomMark({ src: "[CustomComponent]content[end]", format: "markdown" });
			const output = await sm.transpile();
			expect(output).toContain("CustomComponent");
			expect(output).not.toContain("customcomponent");
		});

		it("preserves mixed-case tag names with attributes", async () => {
			const sm = new SomMark({
				src: '[MyWidget = id: "w1"]inner[end]',
				format: "markdown"
			});
			const output = await sm.transpile();
			expect(output).toContain("MyWidget");
			expect(output).not.toContain("mywidget");
		});

	});
});
