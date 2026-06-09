import { describe, it, expect, vi, afterEach } from "vitest";
import { FetchFS } from "../../helpers/fetch-fs.js";

function mockFetch(responses) {
	const fn = vi.fn(async (url) => {
		if (url in responses) {
			const body = responses[url];
			return { ok: true, text: async () => body };
		}
		return { ok: false, status: 404 };
	});
	vi.stubGlobal("fetch", fn);
	return fn;
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("FetchFS", () => {
	describe("constructor", () => {
		it("appends trailing slash to baseURL if missing", () => {
			const fs = new FetchFS("https://example.com/templates");
			expect(fs.baseURL).toBe("https://example.com/templates/");
		});

		it("keeps existing trailing slash", () => {
			const fs = new FetchFS("https://example.com/templates/");
			expect(fs.baseURL).toBe("https://example.com/templates/");
		});
	});

	describe("_resolve", () => {
		const fs = new FetchFS("https://example.com/files/");

		it("returns absolute http URL unchanged", () => {
			expect(fs._resolve("https://cdn.example.com/a.js")).toBe("https://cdn.example.com/a.js");
		});

		it("constructs full URL from relative path", () => {
			expect(fs._resolve("card.smark")).toBe("https://example.com/files/card.smark");
		});

		it("strips leading slash from relative path", () => {
			expect(fs._resolve("/card.smark")).toBe("https://example.com/files/card.smark");
		});
	});

	describe("readFile", () => {
		it("fetches and returns file content", async () => {
			mockFetch({ "https://example.com/files/page.smark": "[h1]Title[end]" });
			const fs = new FetchFS("https://example.com/files/");
			const content = await fs.readFile("page.smark");
			expect(content).toBe("[h1]Title[end]");
		});

		it("caches the response so fetch is only called once", async () => {
			const fetchMock = mockFetch({ "https://example.com/files/data.json": '{"a":1}' });
			const fs = new FetchFS("https://example.com/files/");
			await fs.readFile("data.json");
			await fs.readFile("data.json");
			expect(fetchMock.mock.calls.length).toBe(1);
		});

		it("throws on a non-ok response", async () => {
			mockFetch({});
			const fs = new FetchFS("https://example.com/files/");
			await expect(fs.readFile("missing.smark")).rejects.toThrow("File not found");
		});
	});

	describe("exists", () => {
		it("returns true when the file can be fetched", async () => {
			mockFetch({ "https://example.com/files/a.smark": "content" });
			const fs = new FetchFS("https://example.com/files/");
			expect(await fs.exists("a.smark")).toBe(true);
		});

		it("returns false when the fetch fails", async () => {
			mockFetch({});
			const fs = new FetchFS("https://example.com/files/");
			expect(await fs.exists("nope.smark")).toBe(false);
		});
	});

	describe("existsSync", () => {
		it("returns false before readFile is called", () => {
			const fs = new FetchFS("https://example.com/files/");
			expect(fs.existsSync("card.smark")).toBe(false);
		});

		it("returns true after readFile has populated the cache", async () => {
			mockFetch({ "https://example.com/files/card.smark": "content" });
			const fs = new FetchFS("https://example.com/files/");
			await fs.readFile("card.smark");
			expect(fs.existsSync("card.smark")).toBe(true);
		});
	});

	describe("readFileSync", () => {
		it("throws when file has not been fetched yet", () => {
			const fs = new FetchFS("https://example.com/files/");
			expect(() => fs.readFileSync("card.smark")).toThrow("Not in cache");
		});

		it("returns cached content after readFile", async () => {
			mockFetch({ "https://example.com/files/card.smark": "[div][end]" });
			const fs = new FetchFS("https://example.com/files/");
			await fs.readFile("card.smark");
			expect(fs.readFileSync("card.smark")).toBe("[div][end]");
		});
	});
});
