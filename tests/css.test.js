// ###################
// CSS tests: [style] body, scoped component styles, -- props
// ###################

import { describe, it, expect, vi } from "vitest";
import { fileURLToPath } from "node:url";
import lexer from "../core/lexer.js";
import ArcMoon from "../node/compiler.js";

const FIXTURES = fileURLToPath(new URL("./fixtures/styles", import.meta.url));

const compile = (src, options = {}) => new ArcMoon({ src, cwd: FIXTURES, ...options }).compile();
const flat = (html) => html.replace(/\s*\n\s*/g, "");
const types = (src) => lexer(src).filter((t) => t.type !== "WHITESPACE" && t.type !== "EOF").map((t) => `${t.type}:${t.value}`);

describe("[style] body", () => {
	it("reads only text, escapes and logic", () => {
		expect(types(`[style]#a[type="x"] { c: "\\2014"; } \${ v }\$[end:style]`)).toEqual([
			"OPEN_BRACKET:[", "IDENTIFIER:style", "CLOSE_BRACKET:]",
			`TEXT:#a[type="x"] { c: "\\2014"; } `,
			"LOGIC_OPEN:${", "LOGIC: v ", "LOGIC_CLOSE:}$",
			"OPEN_BRACKET:[", "END_KEYWORD:end:style", "CLOSE_BRACKET:]"
		]);
	});

	it("writes CSS as it is, with \\[end and \\${ as literals", async () => {
		const html = await compile(`[style]#main { color: #333; } .sm\\:hidden { content: "\\[end \\\${"; }[end]`);
		expect(html).toBe(`<style>#main{color:#333}.sm\\:hidden{content:"[end \${"}</style>`);
	});

	it("puts values in and escapes </style", async () => {
		const html = await compile(`\${ const c = "red"; }\$\n[style]p { color: \${ c }\$; content: "\${ "</style>" }\$"; }[end:style]`);
		expect(html).toBe(`<style>p{color:red;content:"<\\/style>"}</style>`);
	});

	it("keeps arcm-raw [style] as written, and drops an empty [style!]", async () => {
		expect(await compile(`[style = arcm-raw: true]a \${ x }\$[end]`)).toBe(`<style>a \${ x }\$</style>`);
		expect(await compile(`[style!][p]x[end]`)).toBe(`<p>x</p>`);
	});
});

describe("scoped component styles", () => {
	it("scopes a component's elements and moves its CSS into <head> once", async () => {
		const html = await compile(
			`[import = Box: "./Box.arcm" !]\n[html][head][title]t[end][end][body][Box][h2]mine[end][end][Box!][h2]page[end][end][end]`
		);
		const attr = /<div class="box" (data-a-[a-z0-9]+)>/.exec(html)[1];
		expect(html.match(/<style>/g)).toHaveLength(1);
		expect(flat(html)).toContain(
			`<head><title>t</title><style>.box[${attr}]{padding:1rem}h2[${attr}],p[${attr}]:before{color:tomato}.dark h2[${attr}]{color:#fff}@media(max-width:600px){.box[${attr}]{padding:0}}@keyframes spin{0%{opacity:0}}</style></head>`
		);
		// Slot content keeps the caller's scope; a child component's insides are not affected
		expect(flat(html)).toContain(`<div class="box" ${attr}><h2 ${attr}>Box</h2><h2>mine</h2><span class="inner">in</span></div>`);
		expect(html).toContain(`<h2>page</h2>`);
	});

	it("bundles a [link] written in a styled component, and removes lines left empty", async () => {
		const html = await compile(`[import = Shell: "./Shell.arcm" !]\n[Shell!]\n[p]x[end]\n[style]\n  p { color: red }\n[end]\n[p]y[end]`);
		expect(html).toMatch(/^<head data-a-[a-z0-9]+><style>body\{color:navy\}p\{color:red\}head\[data-a-[a-z0-9]+\]\{display:none\}<\/style><\/head>\n\n<p>x<\/p>\n<p>y<\/p>$/);
	});

	it("puts the <style> at the start when there is no <head>", async () => {
		const html = await compile(`[import = Box: "./Box.arcm" !]\n[doctype!]\n[Box!]`);
		expect(html).toMatch(/^<!doctype html><style>\.box\[data-a-/);
	});

	it("keeps page styles global", async () => {
		expect(await compile(`[style]h2 { color: red; }[end][h2]x[end]`)).toBe(`<style>h2{color:red}</style><h2>x</h2>`);
	});

	it("rejects runtime ${ }$ in a component's [style]", async () => {
		await expect(compile(`[import = Live: "./Live.arcm" !][Live!]`)).rejects.toThrow(/Live\.arcm:3:14 {2}runtime \$\{ \}\$ is not allowed in a component's \[style\]/);
	});

	it("points CSS errors at the line inside [style]", async () => {
		await expect(compile(`[import = B: "./BadCss.arcm" !][B!]`)).rejects.toThrow(/BadCss\.arcm:3:1 {2}CSS error in \[style\]: Unknown word/);
		await expect(compile(`[p]x[end]\n[style]\n@import "./nope.css";\n[end]`)).rejects.toThrow(/anonymous\.arcm:3:9 {2}Could not resolve "\.\/nope\.css"/);
	});

	it("passes esbuild's CSS warnings on, at the line inside [style]", async () => {
		const onWarning = vi.fn();
		await compile(`[p]x[end]\n[style]\np {\n  color: red;\n  }}\n[end]`, { onWarning });
		expect(onWarning).toHaveBeenCalledWith({ source: expect.stringMatching(/anonymous\.arcm$/), position: { line: 4, character: 3 }, message: `Unexpected "}"` });
	});

	it("warns when uses give different CSS, and keeps the first", async () => {
		const onWarning = vi.fn();
		const html = await compile(`[import = D: "./Differs.arcm" !][D = color: "red" !][D = color: "blue" !]`, { onWarning });
		expect(html).toContain("color:red");
		expect(html).not.toContain("color:#00f");
		expect(onWarning).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("different CSS for different uses") }));
	});
});

describe("-- props", () => {
	it("set CSS variables and join style:", async () => {
		const html = await compile(`\${ const brand = "#e33"; }\$\n[div = style: "color: red;", --gap: "8px", --brand: \${ brand }\$, --off: false][end]`);
		expect(html).toBe(`<div style="color: red; --gap: 8px; --brand: #e33"></div>`);
	});

	it("start live values from the signal", async () => {
		const html = await compile(`runtime \${ import { signal } from "arcmoon/reactive"; const p = signal("30%"); }\$\n[div = --p: runtime \${ p() }\$][end]`);
		expect(html).toMatch(/<div data-arcm-ref="e0" style="--p: 30%"><\/div>/);
	});
});
