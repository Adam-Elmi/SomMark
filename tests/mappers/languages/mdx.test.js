import { describe, it, expect } from "vitest";
import SomMark from "../../../index.js";
import { compile } from "@mdx-js/mdx";

const smSettings = (src, options = {}) => ({
	src,
	format: "mdx",
	...options
});

describe("SomMark MDX Mapper Comprehensive Test Suite", () => {
	/**
	 * Helper to validate that a string is valid, compilable MDX syntax using the official compiler.
	 */
	const validateMDX = async (output) => {
		try {
			await compile(output);
			return true;
		} catch (err) {
			console.error("MDX Compilation Error:", err.message);
			console.error("Offending Output:\n", output);
			throw err;
		}
	};

	describe("Step 1: Tag Casing & Identity", () => {
		it("preserves PascalCase components cleanly for React", async () => {
			const sm = new SomMark(smSettings("[Gallery]Content[end]"));
			const output = await sm.transpile();

			expect(output).toContain("<Gallery>");
			expect(output).toContain("</Gallery>");
			await validateMDX(output);
		});

		it("falls back to lowercase tag representations when encountering lowercase identifiers", async () => {
			const sm = new SomMark(smSettings("[div]Content[end]"));
			const output = await sm.transpile();

			expect(output).toContain("<div>");
			expect(output).toContain("</div>");
			await validateMDX(output);
		});
	});

	describe("Step 2: Attributes and js{...} Expression Mappings", () => {
		it("normalizes class attribute to className for React compatibility", async () => {
			const sm = new SomMark(smSettings('[div = class: "main", id: "root"]Body[end]'));
			const output = await sm.transpile();

			expect(output).toContain('className="main"');
			expect(output).toContain('id="root"');
			await validateMDX(output);
		});

		it("wraps primitives in JSX braces automatically", async () => {
			const sm = new SomMark(smSettings("[MyComp = count: 5, active: true]Body[end]"));
			const output = await sm.transpile();

			expect(output).toContain("count={5}");
			expect(output).toContain("active={true}");
			await validateMDX(output);
		});

		it("supports complex nested JS data structures inside js{...} wrapper", async () => {
			const sm = new SomMark(smSettings('[User = profile: js{ {name: "Adam", roles: ["admin", "dev"], meta: { active: true } } }]Body[end]'));
			const output = await sm.transpile();

			expect(output).toContain('profile={{name:"Adam",roles:["admin","dev"],meta:{active:true}}}');
			await validateMDX(output);
		});

		it("converts inline CSS style strings into structured JSX React style objects", async () => {
			const sm = new SomMark(smSettings('[div = style: "color: red; margin-top: 10px"]Text[end]'));
			const output = await sm.transpile();

			expect(output).toContain('style={{color:"red",marginTop:"10px"}}');
			await validateMDX(output);
		});
	});

	describe("Step 3: Structural Integrity & Nested Stress-Tests", () => {
		it("auto self-closes standard HTML void elements cleanly", async () => {
			const sm = new SomMark(smSettings('[img = src: "logo.png"][end]'));
			const output = await sm.transpile();

			expect(output.trim()).toBe('<img src="logo.png" />');
			await validateMDX(output);
		});

		it("handles extremely deep nested block structures (100 levels) recursively", async () => {
			let src = "DeepData";
			for (let i = 0; i < 100; i++) {
				src = `[lvl${i}]${src}[end]`;
			}

			const sm = new SomMark(smSettings(src));
			const output = await sm.transpile();

			expect(output).toContain("<lvl0>");
			expect(output).toContain("<lvl99>");
			await validateMDX(output);
		});
	});

	describe("Step 4: Special Features & Shared Mappers", () => {
		it("passes through raw JSX/ESM imports via the @_mdx_@ block", async () => {
			const sm = new SomMark(smSettings('@_mdx_@;import { Button } from "./ui";\n\n<Button>Click</Button>@_end_@'));
			const output = await sm.transpile();

			expect(output).toContain('import { Button }');
			expect(output).toContain("<Button>Click</Button>");
			await validateMDX(output);
		});

		it("supports positional and named style parameters inside mdx css tag mapper", async () => {
			const sm = new SomMark(smSettings("(Some Text)->(css = color: red, bg: 1)"));
			const output = await sm.transpile();

			expect(output).toBe('<span style={{color:"red",bg:"1"}}>Some Text</span>');
			await validateMDX(output);
		});
	});

	describe("Step 5: Headings and Shared MDX Mappers", () => {
		it("renders JSX elements for headings by default", async () => {
			const sm = new SomMark(smSettings("[h1]JSX Heading[end]"));
			const output = await sm.transpile();

			expect(output).toContain("<h1>JSX Heading</h1>");
			await validateMDX(output);
		});

		it("renders markdown style headings if format: 'md' override is supplied", async () => {
			const sm = new SomMark(smSettings('[h1 = format: "md"]MD Heading[end]'));
			const output = await sm.transpile();

			expect(output).toBe("# MD Heading");
			await validateMDX(output);
		});

		it("inherits shared markdown inline formatting outputs", async () => {
			const sm = new SomMark(smSettings("[b]Bold[end] and [s]Strike[end]"));
			const output = await sm.transpile();

			expect(output).toContain("**Bold** and ~~Strike~~");
			await validateMDX(output);
		});
	});

	describe("Step 6: Static Logic Blocks", () => {
		it("evaluates server-side static logic blocks correctly inside MDX templates", async () => {
			const sm = new SomMark(smSettings("static ${ 10 / 2 }$"));
			const output = await sm.transpile();
			expect(output).toBe("5");
			await validateMDX(output);
		});

		it("shares declared variables across multiple static blocks inside the same MDX template", async () => {
			const src = `
static \${ let message = "Hello from MDX Static"; }\$
[div]static \${ message }\$[end]
			`.trim();
			const sm = new SomMark(smSettings(src));
			const output = await sm.transpile();
			expect(output).toContain("<div>Hello from MDX Static</div>");
			await validateMDX(output);
		});
	});
});
