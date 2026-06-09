import { describe, it, expect } from "vitest";
import { VirtualFS } from "../../helpers/virtual-fs.js";

describe("VirtualFS", () => {
	describe("constructor", () => {
		it("stores files with normalized paths", () => {
			const vfs = new VirtualFS({ "/a/b/../c.smark": "content" });
			expect(vfs.existsSync("/a/c.smark")).toBe(true);
		});

		it("defaults to empty file map", () => {
			const vfs = new VirtualFS();
			expect(vfs.existsSync("/anything")).toBe(false);
		});
	});

	describe("existsSync", () => {
		it("returns true for a file that was provided", () => {
			const vfs = new VirtualFS({ "/page.smark": "hello" });
			expect(vfs.existsSync("/page.smark")).toBe(true);
		});

		it("returns false for a file that was not provided", () => {
			const vfs = new VirtualFS({ "/page.smark": "hello" });
			expect(vfs.existsSync("/missing.smark")).toBe(false);
		});
	});

	describe("readFileSync", () => {
		it("returns file content for an existing path", () => {
			const vfs = new VirtualFS({ "/data.json": '{"x":1}' });
			expect(vfs.readFileSync("/data.json")).toBe('{"x":1}');
		});

		it("throws for a missing path", () => {
			const vfs = new VirtualFS({});
			expect(() => vfs.readFileSync("/missing.txt")).toThrow("File not found");
		});
	});

	describe("exists (async)", () => {
		it("resolves true for an existing path", async () => {
			const vfs = new VirtualFS({ "/card.smark": "[div][end]" });
			expect(await vfs.exists("/card.smark")).toBe(true);
		});

		it("resolves false for a missing path", async () => {
			const vfs = new VirtualFS({});
			expect(await vfs.exists("/nope.smark")).toBe(false);
		});
	});

	describe("readFile (async)", () => {
		it("resolves file content for an existing path", async () => {
			const vfs = new VirtualFS({ "/hello.txt": "world" });
			expect(await vfs.readFile("/hello.txt")).toBe("world");
		});

		it("rejects for a missing path", async () => {
			const vfs = new VirtualFS({});
			await expect(vfs.readFile("/ghost.txt")).rejects.toThrow("File not found");
		});
	});
});
