import { describe, it, expect } from "vitest";
import SomMark from "../../index.js";

const compile = (src, extra = {}) =>
	new SomMark({ src, format: "html", webOutputs: true, ...extra }).transpile();

describe("SomMark webOutputs Mode", () => {
	describe("Step 1: Return shape", () => {
		it("returns a 3-tuple [html, css, js]", async () => {
			const result = await compile("[p]Hello[end:p]");
			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(3);
		});

		it("html is a non-empty string, css and js are strings", async () => {
			const [html, css, js] = await compile("[p]Hi[end:p]");
			expect(typeof html).toBe("string");
			expect(typeof css).toBe("string");
			expect(typeof js).toBe("string");
		});

		it("throws when both webOutputs and dualOutput are enabled", async () => {
			await expect(
				new SomMark({ src: "[p]x[end]", format: "html", webOutputs: true, dualOutput: true }).transpile()
			).rejects.toThrow();
		});
	});

	describe("Step 2: CSS extraction", () => {
		it("removes [style] block from HTML and places its content in css slot", async () => {
			const [html, css, js] = await compile("[style]\nbody { margin: 0; }\n[end]\n[p]Hello[end:p]");
			expect(html).not.toContain("<style>");
			expect(css).toContain("margin: 0");
			expect(js).toBe("");
		});

		it("merges multiple [style] blocks into a single css string", async () => {
			const [html, css] = await compile(
				"[style]\n.a { color: red; }\n[end]\n[p]Text[end:p]\n[style]\n.b { color: blue; }\n[end]"
			);
			expect(html).not.toContain("<style>");
			expect(css).toContain(".a");
			expect(css).toContain(".b");
		});

		it("extracts [style] nested inside another block", async () => {
			const [html, css] = await compile(
				"[div]\n[style]\n.nested { padding: 0; }\n[end]\n[p]Inner[end:p]\n[end]"
			);
			expect(html).not.toContain("<style>");
			expect(css).toContain(".nested");
		});

		it("extracts [style] inside [head]", async () => {
			const [html, css] = await compile(
				"[head]\n[style]\nbody { margin: 0; }\n[end]\n[end:head]\n[p]Hello[end:p]"
			);
			expect(html).not.toContain("<style>");
			expect(css).toContain("margin: 0");
		});

		it("extracts [style] with dynamic static logic content", async () => {
			const [html, css] = await compile(
				"[style]\n${ return \".dynamic { font-size: 1rem; }\"; }$\n[end]\n[p]Hi[end:p]"
			);
			expect(html).not.toContain("<style>");
			expect(css).toContain(".dynamic");
		});

		it("extracts CSS variables from [Root] block", async () => {
			const [html, css] = await compile(
				"[Root = --color: red !]\n[head]\n[end:head]\n[p]Hello[end:p]"
			);
			expect(html).not.toContain("<style>");
			expect(css).toContain("--color");
		});

		it("produces empty css string when no [style] blocks exist", async () => {
			const [html, css] = await compile("[p]No styles[end:p]");
			expect(css).toBe("");
		});
	});

	describe("Step 3: JS extraction", () => {
		it("emits runtime logic into the js slot", async () => {
			const [html, css, js] = await compile(
				"[p]Hi[end:p]\nruntime ${ document.querySelector(\"p\").textContent = \"ok\"; }$"
			);
			expect(js).toContain("document.querySelector");
		});

		it("js slot is empty when no runtime blocks exist", async () => {
			const [html, css, js] = await compile("[style]\nbody{}\n[end]\n[p]Hi[end:p]");
			expect(js).toBe("");
		});

		it("emits both css and js when both [style] and runtime blocks are present", async () => {
			const [html, css, js] = await compile(
				"[style]\nbody { margin: 0; }\n[end]\n[p]Hi[end:p]\nruntime ${ document.querySelector(\"p\").textContent = \"ok\"; }$"
			);
			expect(css).toContain("margin: 0");
			expect(js).toContain("document.querySelector");
			expect(html).not.toContain("<style>");
		});
	});

	describe("Step 4: HTML integrity", () => {
		it("preserves non-style HTML structure correctly", async () => {
			const [html] = await compile("[style]\nbody{}\n[end]\n[h1]Title[end:h1]\n[p]Body[end:p]");
			expect(html).toContain("<h1>Title</h1>");
			expect(html).toContain("<p>Body</p>");
		});

		it("static logic blocks still execute and render into html", async () => {
			const [html] = await compile("[style]\nbody{}\n[end]\nstatic ${ 2 + 2 }$");
			expect(html).toContain("4");
		});
	});
});
