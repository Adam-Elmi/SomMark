import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import SomMark, { fileHandler } from "../../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, "temp_sandbox_apis");

const run = (src, extra = {}) =>
	new SomMark({ src, format: "html", ...extra }).transpile();

describe("SomMark Sandbox APIs (accessible inside static blocks)", () => {
	beforeAll(() => {
		fs.mkdirSync(tempDir, { recursive: true });
		fs.writeFileSync(path.join(tempDir, "hello.smark"), "[h1]Hello[end:h1]", "utf-8");
		fs.writeFileSync(path.join(tempDir, "data.json"), JSON.stringify({ name: "SomMark" }), "utf-8");
		fs.writeFileSync(path.join(tempDir, "styles.css"), "body { margin: 0; }", "utf-8");
		fs.writeFileSync(path.join(tempDir, "comp.smark"), "[h2]Imported Component[end:h2]", "utf-8");
	});

	afterAll(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	describe("Step 1: fileHandler — read, exists, traversal", () => {
		it("fileHandler.read() returns file contents inside a static block", async () => {
			const result = await run(
				`static \${ const c = await fileHandler.read("${path.join(tempDir, "data.json")}"); return JSON.parse(c).name; }\$`
			);
			expect(result).toBe("SomMark");
		});

		it("fileHandler.exists() returns true for an existing file", async () => {
			const result = await run(
				`static \${ return await fileHandler.exists("${path.join(tempDir, "data.json")}"); }\$`
			);
			expect(result).toBe("true");
		});

		it("fileHandler.exists() returns false for a missing file", async () => {
			const result = await run(
				`static \${ return await fileHandler.exists("${path.join(tempDir, "nonexistent.txt")}"); }\$`
			);
			expect(result).toBe("false");
		});

		it("fileHandler.read() blocks path traversal with ../../", async () => {
			const sm = new SomMark({
				src: `static \${ return await fileHandler.read("../../etc/passwd"); }\$`,
				format: "html",
			});
			await expect(sm.transpile()).rejects.toThrow();
		});

		it("fileHandler exported directly works in Node.js context", async () => {
			const content = await fileHandler.read(path.join(tempDir, "data.json"));
			expect(JSON.parse(content).name).toBe("SomMark");
		});

		it("fileHandler.glob() returns matching files inside a static block", async () => {
			const result = await run(
				`static \${ const files = await fileHandler.glob("${path.join(tempDir, "*.smark")}"); return files.length > 0 ? "found" : "none"; }\$`
			);
			expect(result).toBe("found");
		});
	});

	describe("Step 2: pathHandler (pathe) inside static blocks", () => {
		it("pathHandler.join() concatenates path segments", async () => {
			const result = await run(`static \${ return pathHandler.join("src", "pages", "index.smark"); }\$`);
			expect(result).toBe("src/pages/index.smark");
		});

		it("pathHandler.dirname() returns the parent directory", async () => {
			const result = await run(`static \${ return pathHandler.dirname("/a/b/c.smark"); }\$`);
			expect(result).toBe("/a/b");
		});

		it("pathHandler.basename() returns the file name", async () => {
			const result = await run(`static \${ return pathHandler.basename("/a/b/card.smark"); }\$`);
			expect(result).toBe("card.smark");
		});

		it("pathHandler.extname() returns the file extension", async () => {
			const result = await run(`static \${ return pathHandler.extname("card.smark"); }\$`);
			expect(result).toBe(".smark");
		});

		it("pathHandler.isAbsolute() distinguishes absolute from relative paths", async () => {
			const abs = await run(`static \${ return pathHandler.isAbsolute("/a/b"); }\$`);
			const rel = await run(`static \${ return pathHandler.isAbsolute("a/b"); }\$`);
			expect(abs).toBe("true");
			expect(rel).toBe("false");
		});
	});

	describe("Step 3: SomMark.lexer inside static blocks", () => {
		it("returns an array of tokens for a simple SomMark source", async () => {
			const result = await run(
				`static \${ const tokens = SomMark.lexer("[h1]Hello[end:h1]"); return tokens.length + " tokens"; }\$`
			);
			expect(result).toMatch(/\d+ tokens/);
		});

		it("first token has a type property", async () => {
			const result = await run(
				`static \${ const tokens = SomMark.lexer("[p]Hi[end]"); return typeof tokens[0].type; }\$`
			);
			expect(result).toBe("string");
		});
	});

	describe("Step 4: SomMark.parser inside static blocks", () => {
		it("returns an array of AST nodes", async () => {
			const result = await run(
				`static \${ const nodes = SomMark.parser("[h1]Title[end:h1][p]Body[end:p]"); return nodes.length >= 2 ? "ok" : "bad"; }\$`
			);
			expect(result).toBe("ok");
		});

		it("each node has an id and body", async () => {
			const result = await run(
				`static \${ const [node] = SomMark.parser("[h2]Sub[end:h2]"); return node.id + ":" + Array.isArray(node.body); }\$`
			);
			expect(result).toBe("h2:true");
		});

		it("can extract heading text from AST without compiling", async () => {
			const result = await run(`static \${
				const nodes = SomMark.parser("[h1]Hello[end:h1][h2]World[end:h2]");
				const headings = nodes
					.filter(n => /^h[1-6]$/.test(n.id))
					.map(n => n.body.filter(c => c.type === "Text").map(c => c.text).join("").trim());
				return headings.join(",");
			}\$`);
			expect(result).toBe("Hello,World");
		});
	});

	describe("Step 5: SomMark.compile inside static blocks", () => {
		it("compiles a SomMark string to HTML", async () => {
			const result = await run(
				`static \${ const html = await SomMark.compile("[span]Compiled[end]"); return SomMark.raw(html); }\$`
			);
			expect(result).toBe("<span>Compiled</span>");
		});

		it("reads and compiles a .smark file via fileHandler + SomMark.compile", async () => {
			const filePath = path.join(tempDir, "hello.smark").replace(/\\/g, "/");
			const result = await run(
				`static \${ const src = await fileHandler.read("${filePath}"); const html = await SomMark.compile(src, { format: "html" }); return SomMark.raw(html); }\$`
			);
			expect(result).toContain("<h1>Hello</h1>");
		});

		it("compiled sub-template can itself import another file (fs inheritance)", async () => {
			const compPath = path.join(tempDir, "comp.smark").replace(/\\/g, "/");
			const result = await run(
				`static \${ const src = await fileHandler.read("${compPath}"); const html = await SomMark.compile(src, { format: "html" }); return SomMark.raw(html); }\$`
			);
			expect(result).toContain("<h2>Imported Component</h2>");
		});
	});

	describe("Step 6: Variables fn referencing pre-computed plain data", () => {
		it("a pure lookup function reads from pre-injected data and templates iterate the result", async () => {
			const result = await run(
				`static \${ const posts = getData("posts"); return posts.join(","); }\$`,
				{
					variables: {
						__smarkData: { posts: ["post-a", "post-b"] },
						getData: (folder) => (__smarkData[folder] || []),
					},
				}
			);
			expect(result).toBe("post-a,post-b");
		});
	});
});
