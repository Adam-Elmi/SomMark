import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import evaluator from "../../core/evaluator.js";
import SomMark from "../../index.js";
import { preprocessRuntimeLogic } from "../../core/helpers/preprocessor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, "temp_evaluator");

describe("SomMark Core Sandbox Evaluator Tests", () => {
	beforeAll(() => {
		// Set up dynamic test directory for module loader validation
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}
	});

	afterAll(() => {
		// Clean up isolated test files and directories
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
	});

	afterEach(() => {
		// Ensure that the evaluator singleton context stack is cleanly destroyed/popped between runs
		try {
			while (evaluator.instances.length > 0) {
				evaluator.destroy();
			}
		} catch (e) {
			// ignore
		}

		// Clean up files under tempDir between test cases
		if (fs.existsSync(tempDir)) {
			const files = fs.readdirSync(tempDir);
			for (const file of files) {
				fs.rmSync(path.join(tempDir, file), { recursive: true, force: true });
			}
		}
	});

	describe("Step 1: VM Initialization & Lifecycle Management", () => {
		it("initializes a sandboxed QuickJS VM instance and disposes it cleanly", async () => {
			await evaluator.init(process.cwd());
			expect(evaluator.runtime).not.toBeNull();

			// Verify simple arithmetic expression execution
			const result = await evaluator.execute("2 + 3;");
			expect(result).toBe(5);

			evaluator.destroy();
			expect(evaluator.instances.length).toBe(0);
		});

		it("manages isolated concurrent VM lifecycles recursively via active stack routing", async () => {
			// Initialize Parent Context
			await evaluator.init(process.cwd());
			evaluator.inject({ level: "parent" });
			expect(await evaluator.execute("level;")).toBe("parent");

			// Initialize Recursive Context (spawns nested EvaluatorState instance on the stack)
			await evaluator.init(process.cwd());
			evaluator.inject({ level: "nested" });
			expect(await evaluator.execute("level;")).toBe("nested");

			// Destroy active nested context, restoring the parent context context
			evaluator.destroy();
			expect(await evaluator.execute("level;")).toBe("parent");
		});
	});

	describe("Step 2: Scope Isolation, Variable Syncing & Injection", () => {
		it("injects variables from the host context safely into VM scope", async () => {
			await evaluator.init(process.cwd());
			evaluator.inject({ name: "AdamElmi", status: "active" });

			const res = await evaluator.execute("`User ${name} is ${status}`;");
			expect(res).toBe("User AdamElmi is active");
		});

		it("manages nested block scopes, protecting parent variables from child block overrides", async () => {
			await evaluator.init(process.cwd());
			evaluator.inject({ value: 100 });

			evaluator.pushScope();
			evaluator.inject({ value: 200 }); // child block scope overrides value
			expect(await evaluator.execute("value;")).toBe(200);

			await evaluator.popScope(); // pop scope back to parent
			expect(await evaluator.execute("value;")).toBe(100);
		});

		it("ensures popped scopes delete block-level variables fully from VM globals", async () => {
			await evaluator.init(process.cwd());

			evaluator.pushScope();
			await evaluator.execute("let tempVal = 45;"); // Evaluated inside child scope block
			expect(await evaluator.execute("tempVal;")).toBe(45);

			await evaluator.popScope(); // Pop scope removes tempVal from child block
			await expect(evaluator.execute("tempVal;")).rejects.toThrow();
		});

		it("synchronizes VM global variable assignments back to host scopes stack", async () => {
			await evaluator.init(process.cwd());
			evaluator.inject({ counter: 5 });

			await evaluator.execute("counter = counter + 10;");

			// Verify that the host scope object is mutated during VM sync
			expect(evaluator.active.scopes[0].counter).toBe(15);
		});

		it("automatically exports top-level variable and function declarations into active scope", async () => {
			await evaluator.init(process.cwd());

			// Acorn parser detects 'const x' and 'function double' declarations and exposes them
			await evaluator.execute("const score = 88; function getBonus(s) { return s + 10; }");

			const res = await evaluator.execute("getBonus(score);");
			expect(res).toBe(98);
		});
	});

	describe("Step 3: Global SomMark Standard Library Sandbox APIs", () => {
		it("exposes a frozen, immutable global SomMark namespace inside the sandbox VM", async () => {
			await evaluator.init(process.cwd());

			const isFrozen = await evaluator.execute("Object.isFrozen(SomMark);");
			expect(isFrozen).toBe(true);

			// Attempts to delete or modify the global SomMark object should fail
			await expect(evaluator.execute("delete globalThis.SomMark;")).rejects.toThrow();
		});

		it("supports basic SomMark standard library version and settings metadata properties", async () => {
			await evaluator.init(process.cwd(), {}, { format: "html", dev: true });

			const version = await evaluator.execute("SomMark.version;");
			expect(typeof version).toBe("string");

			const devSetting = await evaluator.execute("SomMark.settings.dev;");
			expect(devSetting).toBe(true);
		});

		it("registers, executes, and unregisters dynamic components block tags inside VM scope", async () => {
			await evaluator.init(process.cwd());

			// Register custom tag
			await evaluator.execute(`
				SomMark.register("custom-card", ({ props, content }) => {
					return SomMark.tag("div").attributes({ class: props.theme }).body(content);
				});
			`);

			expect(evaluator.hasDynamicTag("custom-card")).toBe(true);

			// Execute Dynamic tag inside VM
			const renderResult = await evaluator.executeDynamicTag("custom-card", {
				props: { theme: "glass" },
				content: "Hello Card"
			});
			expect(renderResult).toBe('<div class="glass">Hello Card</div>');

			// Unregister tag
			await evaluator.execute("SomMark.removeOutput('custom-card');");
			expect(evaluator.hasDynamicTag("custom-card")).toBe(false);
		});

		it("builds XML/HTML markup programmatically using the frozen SomMark.tag helper", async () => {
			await evaluator.init(process.cwd());

			const element = await evaluator.execute(`
				SomMark.tag("img")
					.attributes({ src: "pic.png", alt: "User's avatar", width: 100 })
					.selfClose();
			`);
			expect(element).toBe('<img src="pic.png" alt="User&#39;s avatar" width="100" />');
		});

		it("supports recursive transpilation inside the VM using SomMark.compile", async () => {
			await evaluator.init(process.cwd());

			const recursiveResult = await evaluator.execute(`
				await SomMark.compile("[span]Compiles recursively[end]");
			`);
			expect(recursiveResult).toBe("<span>Compiles recursively</span>");
		});

		it("wraps and enforces SomMark.raw unescaped markup rules and security limits", async () => {
			// Enforce allowed raw values (default)
			await evaluator.init(process.cwd(), { allowRaw: true });
			const rawResult = await evaluator.execute("SomMark.raw('<strong>Unescaped</strong>');");
			expect(rawResult).toEqual({ __raw: "<strong>Unescaped</strong>" });

			// Enforce blocked raw values (security)
			await evaluator.init(process.cwd(), { allowRaw: false });
			await expect(evaluator.execute("SomMark.raw('<strong>Blocked</strong>');")).rejects.toThrow("Security Error: SomMark.raw is disabled in this environment.");
		});

		it("evaluates compile-time static expressions via SomMark.static", async () => {
			await evaluator.init(process.cwd());
			const staticVal = await evaluator.execute("SomMark.static('10 * 3');");
			expect(staticVal).toBe(30);
		});
	});

	describe("Step 4: Sandbox Security & Interruption Safety", () => {
		it("blocks non-secure http requests enforcing secure protocol whitelisting", async () => {
			await evaluator.init(process.cwd());

			await expect(evaluator.execute("await SomMark.fetch('http://api.site.com/data');")).rejects.toThrow("HTTP requests are disabled. Use HTTPS instead.");
		});

		it("intercepts and blocks loopback and intranet destinations protecting against SSRF attacks", async () => {
			await evaluator.init(process.cwd());

			await expect(evaluator.execute("await SomMark.fetch('https://localhost:8080/admin');")).rejects.toThrow("SSRF Protection: Requests to local or private IP addresses are forbidden.");
			await expect(evaluator.execute("await SomMark.fetch('https://192.168.1.50/config');")).rejects.toThrow("SSRF Protection: Requests to local or private IP addresses are forbidden.");
		});

		it("enforces allowed fetch whitelisted origins and extension types validations", async () => {
			await evaluator.init(process.cwd(), {
				allowedOrigins: ["https://jsonplaceholder.typicode.com"],
				allowedExtensions: [".json"]
			});

			// Blocked by non-whitelisted origin
			await expect(evaluator.execute("await SomMark.fetch('https://api.gitlab.com/data.json');")).rejects.toThrow("Origin 'https://api.gitlab.com' is not whitelisted.");

			// Blocked by non-whitelisted extension type
			await expect(evaluator.execute("await SomMark.fetch('https://jsonplaceholder.typicode.com/avatar.png');")).rejects.toThrow("Extension '.png' is not whitelisted.");
		});

		it("enforces fetch adapter disablement boundaries", async () => {
			await evaluator.init(process.cwd(), { allowFetch: false });

			await expect(evaluator.execute("await SomMark.fetch('https://jsonplaceholder.typicode.com/users/1');")).rejects.toThrow("fetch is disabled in this environment.");
		});

		it("terminates infinite loop executions immediately enforcing sandboxed timer interrupt safety", async () => {
			// Configure short timeout limit (100ms)
			await evaluator.init(process.cwd(), { timeout: 100 });

			// Infinite loop evaluation should time out and abort cleanly
			await expect(evaluator.execute("while (true) {}")).rejects.toThrow();
		});
	});

	describe("Step 5: Advanced Module Loader & Dynamic Code Rewriting", () => {
		it("resolves and loads dynamic imports for JSON, raw text, and Smark templates relative to baseDir", async () => {
			// Set up isolated modules inside tempDir
			fs.writeFileSync(path.join(tempDir, "user.json"), '{"name": "Adam"}', "utf-8");
			fs.writeFileSync(path.join(tempDir, "doc.txt"), "Raw content file", "utf-8");
			fs.writeFileSync(path.join(tempDir, "elem.smark"), "[b]Bold text[end]", "utf-8");

			await evaluator.init(tempDir);

			// JSON loader
			const name = await evaluator.execute('import user from "./user.json"; user.name;');
			expect(name).toBe("Adam");

			// Raw text loader
			const rawDoc = await evaluator.execute('import doc from "./doc.txt?raw"; doc;');
			expect(rawDoc).toBe("Raw content file");

			// Smark template compiler loader
			const elem = await evaluator.execute('import elem from "./elem.smark"; await elem();');
			expect(elem).toBe("<b>Bold text</b>");
		});

		it("applies auto-expression and auto-return code rewriting dynamically before evaluation", async () => {
			await evaluator.init(process.cwd());

			// Rewrite trailing expression statement to export default return value
			const expResult = await evaluator.execute("let x = 50; x * 2;");
			expect(expResult).toBe(100);

			// Rewrite top-level return statement to export default return value
			const retResult = await evaluator.execute("let y = 15; return y + 5;");
			expect(retResult).toBe(20);
		});
	});

	describe("Step 6: Smark Compiler Integration (Static & JS blocks)", () => {
		it("evaluates compile-time static JS blocks with implicit expressions and explicit return statements", async () => {
			// Implicit
			const srcImplicit = "static ${ 12 * 2 }$";
			const smImplicit = new SomMark({ src: srcImplicit, format: "html" });
			expect(await smImplicit.transpile()).toBe("24");

			// Explicit
			const srcExplicit = "static ${ return 40 + 2; }$";
			const smExplicit = new SomMark({ src: srcExplicit, format: "html" });
			expect(await smExplicit.transpile()).toBe("42");

			// Function return
			const srcFunc = "static ${ function test() { return 100; } return test(); }$";
			const smFunc = new SomMark({ src: srcFunc, format: "html" });
			expect(await smFunc.transpile()).toBe("100");
		});

		it("shares declared variables across static blocks and isolates block-level nested tags", async () => {
			const src = `
static \${
	const title = "Shared Title";
}\$
[div]
	static \${
		const blockVar = "Local Block";
	}\$
	static \${ title + " - " + blockVar }\$
[end]
static \${ typeof blockVar === "undefined" ? "cleaned" : "leak" }\$
			`.trim();

			const smark = new SomMark({ src, format: "html" });
			const output = await smark.transpile();
			expect(output).toContain("Shared Title - Local Block");
			expect(output).toContain("cleaned");
		});

		it("supports secure asynchronous fetch requests inside static template blocks", async () => {
			const src = `
static \${
	const res = await SomMark.fetch("https://jsonplaceholder.typicode.com/users/1");
	const user = await res.json();
	return user.username;
}\$
			`.trim();

			const smark = new SomMark({
				src,
				format: "html",
				security: {
					allowFetch: true,
					allowedOrigins: ["https://jsonplaceholder.typicode.com"]
				}
			});

			const output = await smark.transpile();
			expect(output).toBe("Bret");
		});

		it("enforces top-level return statement nesting checks, raising syntax errors on invalid returns", async () => {
			const src = `
static \${
	if (true) {
		return "nested"; // Error: return is not allowed inside blocks at the top level
	}
}\$
			`.trim();

			const smark = new SomMark({ src, format: "html" });
			await expect(smark.transpile()).rejects.toThrow();
		});

	});

	describe("Step 7: Sandbox Preprocessed Runtime Logic", () => {
		it("preprocesses SomMark.static compile-time executions and serializes results inside runtime blocks", async () => {
			// Initialize the evaluator first since preprocessor calls evaluator.execute internally
			await evaluator.init(process.cwd());

			const src = `
const val = SomMark.static("10 + 20");
			`.trim();

			const preprocessed = await preprocessRuntimeLogic(src);
			expect(preprocessed).toContain("const val = 30;");
		});

		it("preprocesses SomMark.import relative file mappings loading JSON content inside runtime blocks", async () => {
			await evaluator.init(tempDir);

			// Write isolated locale.json to tempDir
			fs.writeFileSync(path.join(tempDir, "locale.json"), '{"welcome": "Welcome back"}', "utf-8");

			const src = `
const lang = SomMark.import("./locale.json");
			`.trim();

			// Pass absolute filename to preprocessor so it resolves relative path correctly
			const preprocessed = await preprocessRuntimeLogic(src, path.join(tempDir, "main.smark"));
			expect(preprocessed).toContain('const lang = {"welcome":"Welcome back"};');
		});

		it("injects global LSP / Linter safety guards automatically when SomMark keyword is referenced", async () => {
			await evaluator.init(process.cwd());

			const src = `
console.log(SomMark.version);
			`.trim();

			const preprocessed = await preprocessRuntimeLogic(src);
			expect(preprocessed).toContain("/* global SomMark */");
			expect(preprocessed).toContain("globalThis.SomMark = { static: (c) => c, import: (c) => c }");
		});
	});

	describe("Step 8: HTML Mapper Runtime Script Tags Rendering", () => {
		it("renders top-level global runtime logic inside raw script tags", async () => {
			const src = `
runtime \${
	const a = 1;
}\$
			`.trim();

			const smark = new SomMark({ src, format: "html" });
			const output = await smark.transpile();
			expect(output).toBe("<script>\n\tconst a = 1;\n</script>");
		});

		it("renders nested local runtime logic inside self-executing script tags isolating parent DOM self scope", async () => {
			const src = `
[div]
	runtime \${
		const text = self.textContent;
	}\$
[end]
			`.trim();

			const smark = new SomMark({ src, format: "html" });
			const output = await smark.transpile();
			expect(output).toContain("const self = document.querySelector('[data-sommark-id=\"sommark-div-");
			expect(output).toContain("const text = self.textContent;");
			expect(output).toContain("})();");
		});
	});
});
