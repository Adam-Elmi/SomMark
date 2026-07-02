import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import SomMark from "../../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modulesDir = path.join(__dirname, "modules");

const tempFiles = {
	"temp_simple.smark": "[span]Simple[end]",
	"temp_circular_A.smark": `[import = b: "./temp_circular_B.smark"][end]\n[$use-module = b][end]`,
	"temp_circular_B.smark": `[import = a: "./temp_circular_A.smark"][end]\n[$use-module = a][end]`,
	"temp_rec1.smark": `[import = r: "./temp_rec2.smark"][end]\n[$use-module = r][end]`,
	"temp_rec2.smark": `[import = r: "./temp_rec3.smark"][end]\n[$use-module = r][end]`,
	"temp_rec3.smark": `[import = r: "./temp_rec4.smark"][end]\n[$use-module = r][end]`,
	"temp_rec4.smark": `[import = r: "./temp_rec5.smark"][end]\n[$use-module = r][end]`,
	"temp_rec5.smark": `[import = r: "./temp_rec6.smark"][end]\n[$use-module = r][end]`,
	"temp_rec6.smark": "[span]Deep[end]",
	"temp_scoped.smark": `[div = class: "card"]v{title}[end]`,
	"temp_indent.smark": `[div = class: "wrapper"]\n    [slot][end]\n[end]`,
	"temp_fallback.smark": `[div = class: "alert"]\n    [slot]Default Warning[end]\n[end]`,
	"temp_self_closing.smark": `[div = class: "placeholder"]\n    [slot!]\n[end]`,
	"temp_fallback_pos.smark": "[div = class: \"item\"]v{0} - v{1}[end]"
};

describe("SomMark Module System Tests", () => {
	beforeAll(() => {
		// Set up dynamic modules in tests/core/modules for granular testing
		for (const [filename, content] of Object.entries(tempFiles)) {
			fs.writeFileSync(path.join(modulesDir, filename), content, "utf-8");
		}
	});

	afterAll(() => {
		// Clean up all dynamically generated test files
		for (const filename of Object.keys(tempFiles)) {
			const filePath = path.join(modulesDir, filename);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		}
	});

	describe("Step 1: Basic Module Functionality & Path Resolution", () => {
		it("resolves and injects a module statically using $use-module", async () => {
			const src = `
[import = simple: "./modules/temp_simple.smark"][end]
[div]
    [$use-module = simple][end]
[end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			const output = await smark.transpile();

			expect(output).toBe("<div><span>Simple</span></div>");
		});

		it("resolves and injects multiple imported modules in different layout slots", async () => {
			const src = `
[import = header: "./modules/E.smark"][end]
[import = footer: "./modules/C.smark"][end]
[div = class: "page"]
    [$use-module = header][end]
    [$use-module = footer][end]
[end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			const output = await smark.transpile();

			expect(output).toBe('<div class="page">\n<header>Title</header><footer>Bottom</footer>\n</div>');
		});

		it("enforces declaration boundaries, throwing an error when import occurs after rendering starts", async () => {
			const src = `
[p]Text content started first[end]
[import = bad: "./modules/temp_simple.smark"][end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			await expect(smark.transpile()).rejects.toThrow("Imports must be declared at the top level before any content");
		});

		it("enforces strict extension mapping, raising error for non-smark imports", async () => {
			const src = '[import = style: "./modules/style.css"][end]';
			const smark = new SomMark({ src, format: "html", filename: __filename });
			await expect(smark.transpile()).rejects.toThrow("Unsupported extension .css for module style");
		});

		it("resolves file paths without extensions by falling back to auto-appending .smark", async () => {
			const src = `
[import = simple: "./modules/temp_simple"][end]
[$use-module = simple][end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			const output = await smark.transpile();
			expect(output).toBe("<span>Simple</span>");
		});

		it("resolves custom configured prefix path aliases to resolve absolute module targets", async () => {
			const src = `
[import = simple: "@/temp_simple.smark"][end]
[$use-module = simple][end]
			`.trim();

			const smark = new SomMark({
				src,
				format: "html",
				filename: __filename,
				importAliases: { "@/": "./tests/core/modules/" }
			});
			const output = await smark.transpile();
			expect(output).toBe("<span>Simple</span>");
		});
	});

	describe("Step 2: Component Scoping, Privacy & Argument Mapping", () => {
		it("maps named attributes into target v{key} variables inside components", async () => {
			const src = `
[import = card: "./modules/temp_scoped.smark"][end]
[card = title: "Product Title"][end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			const output = await smark.transpile();
			expect(output).toBe('<div class="card">Product Title</div>');
		});

		it("maps positional list attributes into indexed v{index} variables inside components", async () => {
			const src = `
[import = list: "./modules/temp_fallback_pos.smark"][end]
[list = "Apple", "Banana"][end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			const output = await smark.transpile();
			expect(output).toBe('<div class="item">Apple - Banana</div>');
		});

		it("applies scope privacy filtering, removing consumed attributes from cascaded root-tag attributes", async () => {
			const src = `
[import = card: "./modules/temp_scoped.smark"][end]
[card = title: "Privacy Test", id: "main-card", style: "border: 1px;"][end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			const output = await smark.transpile();

			// 'title' was consumed, so it should NOT be rendered as title="..." on the outer div.
			// 'id' and 'style' were not consumed, so they must be merged onto the outer div.
			expect(output).toContain('class="card"');
			expect(output).toContain('id="main-card"');
			expect(output).toContain('style="border: 1px;"');
			expect(output).not.toContain('title="Privacy Test"');
			expect(output).toContain('>Privacy Test</div>');
		});

		it("interpolates undefined variables with safe unresolved prefix envelopes", async () => {
			const src = `
[import = card: "./modules/temp_scoped.smark"][end]
[card][end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			const output = await smark.transpile();
			expect(output).toBe('<div class="card">SOMMARK_UNRESOLVED_v_title_SOMMARK</div>');
		});
	});

	describe("Step 3: Slot Layouts & Formatting", () => {
		it("injects caller body content dynamically at slot injection targets", async () => {
			const src = `
[import = card: "./modules/Card.smark"][end]
[card = title: "Slot Body Title"]
    Inside Content
[end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			const output = await smark.transpile();
			expect(output).toContain('<div class="card">');
			expect(output).toContain('<h3>Slot Body Title</h3>');
			expect(output).toContain('<div class="card-body">');
			expect(output).toContain('Inside Content');
		});

		it("resolves standard slots default fallbacks when caller provides no body content", async () => {
			const src = `
[import = alert: "./modules/temp_fallback.smark"][end]
[alert][end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			const output = await smark.transpile();
			expect(output).toBe('<div class="alert">\n    Default Warning\n</div>');
		});

		it("processes self-closing slot styles to output clean empty elements", async () => {
			const src = `
[import = placeholder: "./modules/temp_self_closing.smark"][end]
[placeholder][end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			const output = await smark.transpile();
			expect(output).toBe('<div class="placeholder">    </div>');
		});

		it("propagates leading tab or space indentation onto injected slot body lines recursively", async () => {
			const src = `
[import = layout: "./modules/temp_indent.smark"][end]
[div = class: "outer"]
    [layout]
        Line A
        Line B
    [end]
[end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			const output = await smark.transpile();

			// Inside temp_indent.smark, the slot is preceded by 4 spaces (leading indentation).
			// The caller body has "    Line A\n    Line B".
			// The slot engine must prepend the 4 spaces leading indentation from the sub-template to Line B.
			// Line A is the first line of the block (no change), Line B gets indented.
			// Let's assert the expected structure.
			expect(output).toContain('    Line A');
			expect(output).toContain('        Line B');
		});
	});

	describe("Step 4: Whitespace Trimming & Cache Optimizations", () => {
		it("trims ghost newlines and boundary whitespaces next to structural block tags", async () => {
			const src = `
[import = simple: "./modules/temp_simple.smark"][end]


[$use-module = simple][end]

			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			const output = await smark.transpile();
			expect(output).toBe("<span>Simple</span>");
		});

		it("populates and reuses compiled AST representation inside a shared moduleCache Map", async () => {
			const src = `
[import = simple: "./modules/temp_simple.smark"][end]
[$use-module = simple][end]
[$use-module = simple][end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			const absolutePath = path.resolve(modulesDir, "temp_simple.smark");

			expect(smark.moduleCache.has(absolutePath)).toBe(false);

			const output = await smark.transpile();

			expect(output).toBe("<span>Simple</span><span>Simple</span>");
			expect(smark.moduleCache.has(absolutePath)).toBe(true);
			
			// Verify cached AST node format
			const cachedAst = smark.moduleCache.get(absolutePath);
			expect(Array.isArray(cachedAst)).toBe(true);
			expect(cachedAst[0].type).toBe("Block");
			expect(cachedAst[0].id).toBe("span");
		});

		it("ensures cloned AST isolation, preventing variable substitution from bleeding between component instances", async () => {
			const src = `
[import = card: "./modules/temp_scoped.smark"][end]
[card = title: "First Instance"][end]
[card = title: "Second Instance"][end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			const output = await smark.transpile();

			expect(output).toBe('<div class="card">First Instance</div>\n<div class="card">Second Instance</div>');
		});
	});

	describe("Step 5: Safety Guards & Boundaries", () => {
		it("enforces maximum nesting recursion depth checks, throwing error when exceeding limit", async () => {
			const src = `
[import = r: "./modules/temp_rec1.smark"][end]
[$use-module = r][end]
			`.trim();

			// Limit is default to 5, our recursion path is 6 deep:
			// stack depth of import calls: index.smark (0) -> rec1 (1) -> rec2 (2) -> rec3 (3) -> rec4 (4) -> rec5 (5) -> rec6 (6 -> exceeds 5)
			const smark = new SomMark({ src, format: "html", filename: __filename });
			await expect(smark.transpile()).rejects.toThrow("Recursion Guard: Maximum Smark compilation depth exceeded (limit is 5).");
		});

		it("allows custom configured maxDepth security parameters to customize recursion restrictions", async () => {
			const src = `
[import = r: "./modules/temp_rec1.smark"][end]
[$use-module = r][end]
			`.trim();

			// Configure maxDepth = 2, so it should throw even earlier
			const smark = new SomMark({
				src,
				format: "html",
				filename: __filename,
				security: { maxDepth: 2 }
			});
			await expect(smark.transpile()).rejects.toThrow("Recursion Guard: Maximum Smark compilation depth exceeded (limit is 2).");
		});

		it("detects and stops cyclic module dependency paths, throwing a circular dependency error", async () => {
			const src = `
[import = circ: "./modules/temp_circular_A.smark"][end]
[$use-module = circ][end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			await expect(smark.transpile()).rejects.toThrow("Circular Dependency Detected");
		});

		it("registers non-blocking UnusedModule compilation warning alerts for unused module imports", async () => {
			const src = `
[import = unused: "./modules/temp_simple.smark"][end]
[div]Active page[end]
			`.trim();

			const smark = new SomMark({ src, format: "html", filename: __filename });
			await smark.transpile();

			expect(smark.warnings.length).toBe(1);
			expect(smark.warnings[0].type).toBe("UnusedModule");
			expect(smark.warnings[0].message).toContain("unused");
			expect(smark.warnings[0].message).toContain("is imported but never used");
		});

		it("supports in-memory string compilation with location-independent resolution when baseDir is specified", async () => {
			const src = `
[import = simple: "./temp_simple.smark"][end]
[$use-module = simple][end]
			`.trim();

			// filename is anonymous, but baseDir is explicitly set to modulesDir
			const smark = new SomMark({
				src,
				format: "html",
				filename: "anonymous",
				baseDir: modulesDir
			});
			const output = await smark.transpile();
			expect(output).toBe("<span>Simple</span>");
		});
	});
});
