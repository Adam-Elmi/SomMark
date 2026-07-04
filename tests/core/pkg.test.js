import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import SomMark from "../../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fake package installed under the test modules dir
const pkgRoot = path.join(__dirname, "modules", "node_modules", "test-ui");
const compDir = path.join(pkgRoot, "components");

describe("SomMark pkg: Protocol", () => {
	beforeAll(() => {
		fs.mkdirSync(compDir, { recursive: true });
		fs.writeFileSync(path.join(compDir, "Card.smark"), '[div = class: "card"]v{title}[end]', "utf-8");
		fs.writeFileSync(path.join(compDir, "Badge.smark"), '[span = class: "badge"]v{label}[end]', "utf-8");
	});

	afterAll(() => {
		fs.rmSync(pkgRoot, { recursive: true, force: true });
	});

	describe("Step 1: Basic resolution", () => {
		it("resolves a pkg: import with explicit .smark extension", async () => {
			const sm = new SomMark({
				src: '[import = Card: "pkg:test-ui/components/Card.smark" !]\n[Card = title: "Hello" !]',
				format: "html",
				baseDir: path.join(__dirname, "modules"),
			});
			const output = await sm.transpile();
			expect(output).toContain('class="card"');
			expect(output).toContain("Hello");
		});

		it("resolves a pkg: import without extension via auto-extension", async () => {
			const sm = new SomMark({
				src: '[import = Card: "pkg:test-ui/components/Card" !]\n[Card = title: "World" !]',
				format: "html",
				baseDir: path.join(__dirname, "modules"),
			});
			const output = await sm.transpile();
			expect(output).toContain("World");
		});

		it("resolves multiple different pkg: components in one file", async () => {
			const sm = new SomMark({
				src: [
					'[import = Card: "pkg:test-ui/components/Card" !]',
					'[import = Badge: "pkg:test-ui/components/Badge" !]',
					'[Card = title: "Post" !]',
					'[Badge = label: "New" !]',
				].join("\n"),
				format: "html",
				baseDir: path.join(__dirname, "modules"),
			});
			const output = await sm.transpile();
			expect(output).toContain('class="card"');
			expect(output).toContain('class="badge"');
			expect(output).toContain("Post");
			expect(output).toContain("New");
		});
	});

	describe("Step 2: importAliases + pkg:", () => {
		it("expands a pkg: alias before resolving from node_modules", async () => {
			const sm = new SomMark({
				src: '[import = Card: "pkg:@/Card" !]\n[Card = title: "Aliased" !]',
				format: "html",
				baseDir: path.join(__dirname, "modules"),
				importAliases: { "pkg:@": "pkg:test-ui/components" },
			});
			const output = await sm.transpile();
			expect(output).toContain("Aliased");
		});

		it("alias preserves pkg: scheme so it is not treated as a local path", async () => {
			const sm = new SomMark({
				src: '[import = Badge: "pkg:ui/Badge" !]\n[Badge = label: "Tag" !]',
				format: "html",
				baseDir: path.join(__dirname, "modules"),
				importAliases: { "pkg:ui": "pkg:test-ui/components" },
			});
			const output = await sm.transpile();
			expect(output).toContain("Tag");
		});
	});

	describe("Step 3: Security — path traversal blocked", () => {
		const opts = { format: "html", baseDir: path.join(__dirname, "modules") };

		it("blocks pkg: path with leading ../", async () => {
			const sm = new SomMark({
				src: '[import = X: "pkg:../../package.json" !][X !]',
				...opts,
			});
			await expect(sm.transpile()).rejects.toThrow();
		});

		it("blocks pkg: with encoded traversal after resolve", async () => {
			const sm = new SomMark({
				src: '[import = X: "pkg:test-ui/../../../index.js" !][X !]',
				...opts,
			});
			await expect(sm.transpile()).rejects.toThrow();
		});

		it("blocks empty pkg: path", async () => {
			const sm = new SomMark({
				src: '[import = X: "pkg:" !][X !]',
				...opts,
			});
			await expect(sm.transpile()).rejects.toThrow();
		});
	});

	describe("Step 4: Security — browser / non-node fs blocked", () => {
		it("blocks pkg: when VirtualFS is used (files: option)", async () => {
			const sm = new SomMark({
				src: '[import = Card: "pkg:test-ui/components/Card" !][Card = title: "x" !]',
				format: "html",
				files: { "/index.smark": "" },
			});
			await expect(sm.transpile()).rejects.toThrow();
		});

		it("blocks pkg: when a custom fs without __isNodeFs is provided", async () => {
			const sm = new SomMark({
				src: '[import = Card: "pkg:test-ui/components/Card" !][Card = title: "x" !]',
				format: "html",
				fs: { readFile: async () => "", exists: async () => false },
			});
			await expect(sm.transpile()).rejects.toThrow();
		});
	});
});
