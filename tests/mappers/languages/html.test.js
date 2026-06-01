import { describe, it, expect } from "vitest";
import SomMark from "../../../index.js";
import { JSDOM } from "jsdom";

const smSettings = (src, options = {}) => ({
	src,
	format: "html",
	...options
});

describe("SomMark HTML Mapper Comprehensive Test Suite", () => {
	/**
	 * Helper to validate that a string is valid, parseable HTML using jsdom.
	 */
	const validateHtml = (output) => {
		const dom = new JSDOM(output);
		expect(dom.window.document).toBeDefined();
		return dom;
	};

	describe("Step 1: Standard Elements & Escaping", () => {
		it("renders standard basic blocks cleanly into HTML representations", async () => {
			const sm = new SomMark(smSettings("[p]Content[end]"));
			const output = await sm.transpile();
			expect(output).toBe("<p>Content</p>");
			
			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("p").textContent).toBe("Content");
		});

		it("falls back to lowercase tag representations when encountering unknown identifiers", async () => {
			const sm = new SomMark(smSettings("[MyCustomTag]Content[end]"));
			const output = await sm.transpile();
			expect(output).toBe("<mycustomtag>Content</mycustomtag>");

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("mycustomtag").textContent).toBe("Content");
		});

		it("processes deeply nested block structures recursively without stack overflow", async () => {
			let src = "Content";
			for (let i = 0; i < 100; i++) {
				src = `[div = id: "layer-${i}"]${src}[end]`;
			}
			const sm = new SomMark(smSettings(src));
			const output = await sm.transpile();

			expect(output).toContain('id="layer-99"');
			expect(output).toContain('id="layer-0"');
			expect((output.match(/<div/g) || []).length).toBe(100);

			const dom = validateHtml(output);
			expect(dom.window.document.getElementById("layer-99")).toBeDefined();
			expect(dom.window.document.getElementById("layer-0").textContent).toBe("Content");
		});

		it("escapes standard HTML special characters inside text nodes for security", async () => {
			const sm = new SomMark(smSettings("[p]Escape & <tags>[end]"));
			const output = await sm.transpile();
			expect(output).toBe("<p>Escape &amp; &lt;tags&gt;</p>");

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("p").innerHTML).toBe("Escape &amp; &lt;tags&gt;");
		});
	});

	describe("Step 2: Void Elements & Self-Closing Elements", () => {
		it("auto self-closes standard HTML void elements regardless of template tag styles", async () => {
			const sm = new SomMark(smSettings('[img = src: "a.png"][end]\n[br][end]'));
			const output = await sm.transpile();

			// For void elements, HTML mapper automatically calls .selfClose()
			expect(output).toContain('<img src="a.png" />');
			expect(output).toContain("<br />");

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("img").getAttribute("src")).toBe("a.png");
		});

		it("compiles standard block tags explicitly marked with exclamation mark ! as self-closed elements", async () => {
			const sm = new SomMark(smSettings("[div = class: 'box' !]"));
			const output = await sm.transpile();
			expect(output).toBe('<div class="box" />');

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("div").getAttribute("class")).toBe("box");
		});
	});

	describe("Step 3: Attributes Validation & Custom Whitelists", () => {
		it("renders global native attributes like id and class correctly", async () => {
			const sm = new SomMark(smSettings('[div = id: "main", class: "container"]Content[end]'));
			const output = await sm.transpile();
			expect(output).toBe('<div id="main" class="container">Content</div>');

			const dom = validateHtml(output);
			const el = dom.window.document.getElementById("main");
			expect(el.getAttribute("class")).toBe("container");
			expect(el.textContent).toBe("Content");
		});

		it("preserves whitelisted custom attributes literally on HTML elements", async () => {
			const sm = new SomMark(smSettings('[div = title: "Hover me", custom: "val"]Content[end]', {
				customProps: ["custom"]
			}));
			const output = await sm.transpile();

			// 'custom' is whitelisted, so it is rendered literally instead of moving to the style attribute
			expect(output).toBe('<div title="Hover me" custom="val">Content</div>');

			const dom = validateHtml(output);
			const el = dom.window.document.querySelector("div");
			expect(el.getAttribute("title")).toBe("Hover me");
			expect(el.getAttribute("custom")).toBe("val");
		});
	});

	describe("Step 4: Smart Attributes Mappings & Smart Styling", () => {
		it("normalizes camelCase event attributes to standard lowercase counterparts", async () => {
			const sm = new SomMark(smSettings('[button = onClick: "alert()"]Click[end]'));
			const output = await sm.transpile();
			expect(output).toBe('<button onclick="alert()">Click</button>');

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("button").getAttribute("onclick")).toBe("alert()");
		});

		it("normalizes camelCase aria attributes to standard kebabized counterparts", async () => {
			const sm = new SomMark(smSettings('[button = ariaLabel: "Close"]X[end]'));
			const output = await sm.transpile();
			expect(output).toBe('<button aria-label="Close">X</button>');

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("button").getAttribute("aria-label")).toBe("Close");
		});

		it("consolidates unrecognized styling properties into the style attribute", async () => {
			const sm = new SomMark(smSettings('[div = backgroundColor: "red", marginTop: "10px"]Content[end]'));
			const output = await sm.transpile();
			expect(output).toBe('<div style="background-color:red;margin-top:10px;">Content</div>');

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("div").getAttribute("style")).toBe("background-color:red;margin-top:10px;");
		});

		it("supports kebab-case alternative style property syntax mapping", async () => {
			const sm = new SomMark(smSettings('[div = "background-color": "blue"]Content[end]'));
			const output = await sm.transpile();
			expect(output).toBe('<div style="background-color:blue;">Content</div>');

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("div").getAttribute("style")).toBe("background-color:blue;");
		});

		it("kebabizes unrecognized native attributes and appends them as custom style properties", async () => {
			const sm = new SomMark(smSettings('[div = title: "Hover me", customAttr: "val"]Content[end]'));
			const output = await sm.transpile();
			expect(output).toBe('<div title="Hover me" style="custom-attr:val;">Content</div>');

			const dom = validateHtml(output);
			const el = dom.window.document.querySelector("div");
			expect(el.getAttribute("title")).toBe("Hover me");
			expect(el.getAttribute("style")).toBe("custom-attr:val;");
		});
	});

	describe("Step 5: fallbackTarget Compiler Configurations", () => {
		it("maps unrecognized properties to style by default or when fallbackTarget is style", async () => {
			const smDefault = new SomMark(smSettings('[div = theme: "dark"]Content[end]'));
			const smStyle = new SomMark(smSettings('[div = theme: "dark"]Content[end]', { fallbackTarget: "style" }));

			const outDefault = await smDefault.transpile();
			const outStyle = await smStyle.transpile();

			expect(outDefault).toBe('<div style="theme:dark;">Content</div>');
			expect(outStyle).toBe('<div style="theme:dark;">Content</div>');

			const dom1 = validateHtml(outDefault);
			expect(dom1.window.document.querySelector("div").getAttribute("style")).toBe("theme:dark;");
		});

		it("maps unrecognized properties as classes and suffixes when fallbackTarget is class", async () => {
			// Boolean true resolves as class name, while key-value resolves as class suffix 'key-val'
			const sm = new SomMark(smSettings('[div = theme: "dark", bold: true, class: "card"]Content[end]', {
				fallbackTarget: "class"
			}));
			const output = await sm.transpile();
			expect(output).toBe('<div class="card theme-dark bold">Content</div>');

			const dom = validateHtml(output);
			const classes = dom.window.document.querySelector("div").classList;
			expect(classes.contains("card")).toBe(true);
			expect(classes.contains("theme-dark")).toBe(true);
			expect(classes.contains("bold")).toBe(true);
		});

		it("renders unrecognized properties literally on the HTML element when fallbackTarget is false", async () => {
			const sm = new SomMark(smSettings('[div = theme: "dark", bold: "true"]Content[end]', {
				fallbackTarget: false
			}));
			const output = await sm.transpile();
			expect(output).toBe('<div theme="dark" bold="true">Content</div>');

			const dom = validateHtml(output);
			const el = dom.window.document.querySelector("div");
			expect(el.getAttribute("theme")).toBe("dark");
			expect(el.getAttribute("bold")).toBe("true");
		});
	});

	describe("Step 6: Registered Custom Outputs & Shared Mappers", () => {
		it("renders the DOCTYPE output correctly", async () => {
			const sm = new SomMark(smSettings("[doctype][end]"));
			const output = await sm.transpile();
			expect(output).toBe("<!DOCTYPE html>");
			// DOCTYPE is valid XML/HTML declaration
		});

		it("collects global CSS variables and dynamically injects them inside a head style block", async () => {
			const src = `
[root = --theme-color: "#fff"][end]
[doctype][end]
[html]
	[head]
		[title]Metadata Page[end]
	[end]
	[body]
		Welcome
	[end]
[end]
			`.trim();

			const sm = new SomMark(smSettings(src));
			const output = await sm.transpile();

			expect(output).toContain("<style>:root { --theme-color:#fff; }</style>");
			expect(output).toContain("<head><style>:root { --theme-color:#fff; }</style>");
			expect(output).toContain("<title>Metadata Page</title>");

			const dom = validateHtml(output);
			const title = dom.window.document.querySelector("title").textContent;
			expect(title).toBe("Metadata Page");
			expect(dom.window.document.querySelector("style").innerHTML).toContain("--theme-color:#fff;");
		});

		it("renders inline css style span tags correctly", async () => {
			const sm = new SomMark(smSettings('(Styled text)->(css: "color: blue", fontWeight: "bold")'));
			const output = await sm.transpile();
			expect(output).toBe('<span style="color:blue;font-weight:bold">Styled text</span>');

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("span").getAttribute("style")).toBe("color:blue;font-weight:bold");
		});

		it("transpiles shared raw blocks and inline styled span layouts correctly", async () => {
			const sm = new SomMark(smSettings("@_raw_@;<b>Raw</b>@_end_@ (Text)->(css: \"color: red\")"));
			const output = await sm.transpile();
			expect(output).toBe('<b>Raw</b> <span style="color:red">Text</span>');

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("b").textContent).toBe("Raw");
			expect(dom.window.document.querySelector("span").getAttribute("style")).toBe("color:red");
		});
	});

	describe("Step 7: Static & Runtime Logic Blocks", () => {
		it("evaluates static logic compile-time blocks successfully", async () => {
			const sm = new SomMark(smSettings("static ${ 5 + 5 }$"));
			const output = await sm.transpile();
			expect(output).toBe("10");

			const dom = validateHtml(output);
			expect(dom.window.document.body.textContent.trim()).toBe("10");
		});

		it("shares declared variables across multiple static blocks inside the same template", async () => {
			const src = `
static \${ let title = "SomMark Test"; }\$
[h1]static \${ title }\$[end]
			`.trim();
			const sm = new SomMark(smSettings(src));
			const output = await sm.transpile();
			expect(output).toContain("<h1>SomMark Test</h1>");

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("h1").textContent).toBe("SomMark Test");
		});

		it("formats global runtime logic scripts successfully", async () => {
			const sm = new SomMark(smSettings("runtime ${ console.log('hello'); }$"));
			const output = await sm.transpile();
			expect(output).toContain("<script>");
			expect(output).toContain("console.log('hello');");
			expect(output).toContain("</script>");

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("script").textContent.trim()).toBe("console.log('hello');");
		});

		it("formats nested block-level runtime logic wrapped in async self-executing functions", async () => {
			const src = `
[div]
	runtime \${ console.log(self); }\$
[end]
			`.trim();
			const sm = new SomMark(smSettings(src));
			const output = await sm.transpile();
			expect(output).toContain("const self = document.querySelector('[data-sommark-id=\"sommark-div-");
			expect(output).toContain("console.log(self);");

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("div script")).toBeDefined();
		});

		it("cooperates between server-side static and client-side runtime blocks using SomMark.static", async () => {
			const src = `
static \${ let count = 100; }\$
runtime \${
	const base = SomMark.static("count");
	const double = SomMark.static("count * 2");
	console.log(base, double);
}\$
			`.trim();
			const sm = new SomMark(smSettings(src));
			const output = await sm.transpile();
			expect(output).toContain("<script>");
			expect(output).toContain("const base = 100;");
			expect(output).toContain("const double = 200;");

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("script").textContent).toContain("const base = 100;");
		});

		it("bakes compile-time settings into client runtime script using SomMark.settings", async () => {
			const src = `
runtime \${
	const format = SomMark.static("SomMark.settings.format");
	console.log(format);
}\$
			`.trim();
			const sm = new SomMark(smSettings(src));
			const output = await sm.transpile();
			expect(output).toContain("<script>");
			expect(output).toContain('const format = "html";');

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("script").textContent).toContain('const format = "html";');
		});

		it("compiles and outputs unescaped HTML recursively inside static blocks using SomMark.compile and SomMark.raw", async () => {
			const src = `
static \${
	const username = "Adam";
	const output = await SomMark.compile("[p]Greeting " + username + "![end]", {
		format: "html"
	});
	return SomMark.raw(output);
}\$
			`.trim();
			const sm = new SomMark(smSettings(src));
			const output = await sm.transpile();
			expect(output).toBe("<p>Greeting Adam!</p>");

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("p").textContent).toBe("Greeting Adam!");
		});

		it("asynchronously fetches allowed external resources inside static blocks securely", async () => {
			const src = `
static \${
	const res = await SomMark.fetch("https://api.github.com/users/Adam-Elmi");
	const user = await res.json();
	return "User login is " + user.login;
}\$
			`.trim();
			const sm = new SomMark(smSettings(src, {
				security: {
					allowFetch: true,
					allowedOrigins: ["https://api.github.com"]
				}
			}));
			const output = await sm.transpile();
			expect(output).toBe("User login is Adam-Elmi");

			const dom = validateHtml(output);
			expect(dom.window.document.body.textContent.trim()).toBe("User login is Adam-Elmi");
		});

		it("blocks SSRF and invalid security origins when fetching inside static blocks", async () => {
			// SSRF localhost check
			const srcSSRF = `static \${ await SomMark.fetch("https://localhost:8080/admin") }\$`;
			const smSSRF = new SomMark(smSettings(srcSSRF));
			await expect(smSSRF.transpile()).rejects.toThrow();

			// Non-allowed origin check
			const srcOrigin = `static \${ await SomMark.fetch("https://api.gitlab.com/data") }\$`;
			const smOrigin = new SomMark(smSettings(srcOrigin, {
				security: {
					allowFetch: true,
					allowedOrigins: ["https://api.github.com"]
				}
			}));
			await expect(smOrigin.transpile()).rejects.toThrow();
		});

		it("injects LSP/Linter safety guards automatically inside preprocessed runtime block output", async () => {
			const src = `
runtime \${
	console.log(SomMark.version);
}\$
			`.trim();
			const sm = new SomMark(smSettings(src));
			const output = await sm.transpile();
			expect(output).toContain("/* global SomMark */");
			expect(output).toContain("globalThis.SomMark = { static: (c) => c, import: (c) => c }");

			const dom = validateHtml(output);
			expect(dom.window.document.querySelector("script").textContent).toContain("/* global SomMark */");
		});
	});
});
