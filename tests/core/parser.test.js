import { describe, it, expect } from "vitest";
import { parseSync } from "../../index.js";
import { BLOCK, TEXT, INLINE, ATBLOCK, COMMENT, IMPORT, USE_MODULE } from "../../core/labels.js";

describe("SomMark Parser (High-Reliability Suite)", () => {

	describe("1. Structural Integrity & Nesting", () => {
		it("should parse deeply nested blocks accurately", () => {
			const ast = parseSync("[1][2][3]content[end][end][end]");
			expect(ast[0].id).toBe("1");
			expect(ast[0].body[0].id).toBe("2");
			expect(ast[0].body[0].body[0].id).toBe("3");
			expect(ast[0].body[0].body[0].body[0].text).toBe("content");
		});

		it("should track node ranges across multiple lines", () => {
			const ast = parseSync("[tag]\nLine 1\n[end]");
			const block = ast[0];
			expect(block.range.start.line).toBe(0);
			expect(block.range.end.line).toBe(2);
		});
	});

	describe("2. Argument Parsing (V4 Native Strategy)", () => {
		it("should preserve positional indices for ALL arguments (Named + Positional)", () => {
			const ast = parseSync("[tag = pos1, named:val, pos2][end]");
			const args = ast[0].args;
			expect(args["0"]).toBe("pos1");
			expect(args["1"]).toBe("val");
			expect(args["2"]).toBe("pos2");
			expect(args["named"]).toBe("val");
		});

		it("should resolve js{} into native Javascript objects", () => {
			const ast = parseSync("[tag = data: js{ {a:{b:1}, c:[1,2]} }][end]");
			const data = ast[0].args.data;
			expect(data).toMatchObject({ a: { b: 1 }, c: [1, 2] });
			expect(typeof data).toBe("object");
		});

		it("should resolve p{} placeholders in regular and quoted values", () => {
			const config = { placeholders: { user: "Adam", rank: "Admin" } };
			const ast = parseSync("[tag = p{user}, greet: \"Hello p{user} (p{rank})\"][end]", config);
			expect(ast[0].args["0"]).toBe("Adam");
			expect(ast[0].args.greet).toBe("Hello Adam (Admin)");
		});

		it("should handle quoted keys with spaces or special characters", () => {
			const ast = parseSync("[tag = \"User Name\": \"Adam\"][end]");
			expect(ast[0].args["User Name"]).toBe("Adam");
			expect(ast[0].args["0"]).toBe("Adam");
		});
	});

	describe("3. Inline Statements & Fallbacks", () => {
		it("should downgrade non-mapping parentheses to individual TEXT nodes", () => {
			const ast = parseSync("This is (just text)");
			// Index 1 is the "(" itself
			expect(ast[1]).toMatchObject({ type: TEXT, text: "(" });
			// Index 2 is the "just text"
			expect(ast[2]).toMatchObject({ type: TEXT, text: "just text" });
		});

		it("should correctly handle escaped characters in inline content", () => {
			const ast = parseSync("(\\(esc\\))->(bold)");
			expect(ast[0]).toMatchObject({ type: INLINE, id: "bold", value: "(esc)" });
		});
	});

	describe("4. At-Blocks & Selective Escape", () => {
		it("should preserve structural syntax inside At-Blocks", () => {
			const ast = parseSync("@_code_@; [div][end] @_end_@");
			expect(ast[0].content).toBe(" [div][end] ");
		});

		it("should selectively unescape structural markers inside At-Block body", () => {
			// In At-Blocks, \@\_ should become @_
			const ast = parseSync("@_test_@; \\@\\_preserved @_end_@");
			expect(ast[0].content).toBe(" @_preserved ");
		});
	});

	describe("5. Reserved Identifier Types", () => {
		it("should assign correct node types to structural commands (using = syntax)", () => {
			const importAst = parseSync("[import = \"style.css\"][end]");
			const useAst = parseSync("[$use-module = myMod][end]");
			expect(importAst[0].type).toBe(IMPORT);
			expect(useAst[0].type).toBe(USE_MODULE);
		});
	});

	describe("6. Error Recovery Typos (Levenstein Suggestion)", () => {
		it("should NOT throw if blocks are correctly closed", () => {
			expect(() => parseSync("[a][end]")).not.toThrow();
		});
	});
});
