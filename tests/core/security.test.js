import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import evaluator from "../../core/evaluator.js";
import SomMark from "../../index.js";
import { preprocessRuntimeLogic } from "../../core/helpers/preprocessor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, "temp_security");

describe("SomMark Security Model Tests", () => {
	beforeEach(() => {
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}
	});

	afterEach(() => {
		try {
			while (evaluator.instances.length > 0) evaluator.destroy();
		} catch {}

		if (fs.existsSync(tempDir)) {
			for (const f of fs.readdirSync(tempDir)) {
				fs.rmSync(path.join(tempDir, f), { recursive: true, force: true });
			}
		}

		evaluator.setDefaultEnv(process.env);
	});

	describe("Step 1: Function Injection Blocking", () => {
		it("silently drops function values from inject() leaving the key undefined in the sandbox", async () => {
			await evaluator.init(process.cwd());
			evaluator.inject({ safeValue: "hello", callback: () => "blocked" });

			expect(await evaluator.execute("safeValue;")).toBe("hello");
			expect(await evaluator.execute("typeof callback === 'undefined';")).toBe(true);
		});

		it("blocks entire objects that contain nested function values", async () => {
			await evaluator.init(process.cwd());
			evaluator.inject({
				user: {
					name: "Adam",
					getToken: () => "secret"
				}
			});

			expect(await evaluator.execute("typeof user === 'undefined';")).toBe(true);
		});

		it("allows plain data: strings, numbers, booleans, arrays, and nested plain objects", async () => {
			await evaluator.init(process.cwd());
			evaluator.inject({
				name: "Adam",
				age: 25,
				active: true,
				tags: ["dev", "design"],
				profile: { city: "Mogadishu", score: 99 }
			});

			expect(await evaluator.execute("name;")).toBe("Adam");
			expect(await evaluator.execute("age;")).toBe(25);
			expect(await evaluator.execute("active;")).toBe(true);
			expect(await evaluator.execute("tags[1];")).toBe("design");
			expect(await evaluator.execute("profile.city;")).toBe("Mogadishu");
		});

		it("allows null and undefined values through inject()", async () => {
			await evaluator.init(process.cwd());
			evaluator.inject({ emptyVal: null });

			expect(await evaluator.execute("emptyVal === null;")).toBe(true);
		});
	});

	describe("Step 2: SomMark.env() Allowlist Enforcement", () => {
		it("returns undefined when the key is not in security.env allowlist", async () => {
			evaluator.setDefaultEnv({ SECRET: "top-secret" });

			const sm = new SomMark({
				src: "static ${ return String(SomMark.env('SECRET')); }$",
				format: "html",
				security: { env: [] }
			});
			const output = await sm.transpile();
			expect(output).toBe("undefined");
		});

		it("returns the env value when the key is explicitly in security.env", async () => {
			evaluator.setDefaultEnv({ API_BASE: "https://api.example.com" });

			const sm = new SomMark({
				src: "static ${ return SomMark.env('API_BASE'); }$",
				format: "html",
				security: { env: ["API_BASE"] }
			});
			const output = await sm.transpile();
			expect(output).toBe("https://api.example.com");
		});

		it("returns undefined for an allowlisted key that does not exist in the env", async () => {
			evaluator.setDefaultEnv({ OTHER: "value" });

			const sm = new SomMark({
				src: "static ${ return String(SomMark.env('MISSING_KEY')); }$",
				format: "html",
				security: { env: ["MISSING_KEY"] }
			});
			const output = await sm.transpile();
			expect(output).toBe("undefined");
		});

		it("returns undefined when security.env is omitted (empty allowlist by default)", async () => {
			evaluator.setDefaultEnv({ DB_PASSWORD: "hunter2" });

			const sm = new SomMark({
				src: "static ${ return String(SomMark.env('DB_PASSWORD')); }$",
				format: "html"
			});
			const output = await sm.transpile();
			expect(output).toBe("undefined");
		});

		it("only exposes exactly the keys listed in security.env, not sibling keys", async () => {
			evaluator.setDefaultEnv({ ALLOWED: "yes", BLOCKED: "no" });

			const sm = new SomMark({
				src: "static ${ return SomMark.env('ALLOWED') + ':' + String(SomMark.env('BLOCKED')); }$",
				format: "html",
				security: { env: ["ALLOWED"] }
			});
			const output = await sm.transpile();
			expect(output).toBe("yes:undefined");
		});
	});

	describe("Step 3: SomMark.import Path Security", () => {
		it("rejects absolute paths with a Security Error", async () => {
			await evaluator.init(tempDir);
			const code = "const x = SomMark.import('/etc/passwd');";
			await expect(
				preprocessRuntimeLogic(code, path.join(tempDir, "index.smark"))
			).rejects.toThrow("Security Error");
		});

		it("rejects path traversal that escapes the project directory", async () => {
			const subDir = path.join(tempDir, "pages");
			fs.mkdirSync(subDir, { recursive: true });

			await evaluator.init(subDir);
			// "../../secret.txt" from pages/ resolves above tempDir
			const code = "const x = SomMark.import('../../secret.txt');";
			await expect(
				preprocessRuntimeLogic(code, path.join(subDir, "index.smark"))
			).rejects.toThrow("Security Error");
		});

		it("allows valid relative imports within the base directory", async () => {
			fs.writeFileSync(path.join(tempDir, "data.json"), '{"ok":true}', "utf-8");

			await evaluator.init(tempDir);
			const code = "const data = SomMark.import('./data.json');";
			const result = await preprocessRuntimeLogic(code, path.join(tempDir, "index.smark"));
			expect(result).toContain('{"ok":true}');
		});

	});
});
