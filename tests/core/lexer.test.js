import { describe, it, expect } from "vitest";
import lexer from "../../core/lexer.js";
import TOKEN_TYPES from "../../core/tokenTypes.js";

describe("SomMark Lexer (Reliability Suite)", () => {
	const tokenize = (src) => lexer(src);

	describe("1. State Recovery & Stability", () => {
		it("should persist block headers across newlines (Flexible Syntax)", () => {
			const tokens = tokenize("[unclosed\nStill Value");
			expect(tokens[0].type).toBe(TOKEN_TYPES.OPEN_BRACKET);
			expect(tokens[1].type).toBe(TOKEN_TYPES.IDENTIFIER);
			// Newline does NOT reset state
			expect(tokens[2]).toMatchObject({ type: TOKEN_TYPES.WHITESPACE, value: "\n" });
			expect(tokens[3]).toMatchObject({ type: TOKEN_TYPES.VALUE, value: "Still" });
		});

		it("should persist At-Block headers across newlines (Flexible Syntax)", () => {
			const tokens = tokenize("@_unclosed\nStill Value");
			expect(tokens[0].type).toBe(TOKEN_TYPES.OPEN_AT);
			expect(tokens[2]).toMatchObject({ type: TOKEN_TYPES.WHITESPACE, value: "\n" });
			expect(tokens[3]).toMatchObject({ type: TOKEN_TYPES.VALUE, value: "Still" });
		});
	});

	describe("2. Complex Data Handling (Prefix Layers)", () => {
		it("should handle nested braces in js{} blocks", () => {
			const src = "[tag = val: js{ {a:{b:1}} }][end]";
			const tokens = tokenize(src);
			const jsToken = tokens.find(t => t.type === TOKEN_TYPES.PREFIX_JS);
			expect(jsToken.value).toBe("js{ {a:{b:1}} }");
		});

		it("should handle escaped quotes inside quoted values", () => {
			const tokens = tokenize("[tag = key: \"A \\\"Quote\\\"\"][end]");
			// Engine splits quoted contents into multiple tokens (VALUE + ESCAPE + VALUE)
			const val1 = tokens.find(t => t.value === "A ");
			const esc = tokens.find(t => t.type === TOKEN_TYPES.ESCAPE);
			const val2 = tokens.find(t => t.value === "Quote");
			
			expect(val1).toBeDefined();
			expect(esc.value).toBe("\\\"");
			expect(val2).toBeDefined();
		});
	});

	describe("3. Contextual Punctuation (Inlines & Headers)", () => {
		it("should treat colons as TEXT inside inline content Parentheses", () => {
			const tokens = tokenize("(text : with : colons)->(id)");
			// Since our fix, THIS SHOULD PASS because isInInlineMapper is false for the first paren
			const textToken = tokens.find(t => t.value === "text : with : colons");
			expect(textToken).toBeDefined();
			expect(tokens.find(t => t.type === TOKEN_TYPES.CLOSE_PAREN)).toBeDefined();
		});

		it("should distinguish KEYs and VALUEs by looking ahead for colons", () => {
			const tokens = tokenize("[tag = myKey: myVal][end]");
			expect(tokens.find(t => t.value === "myKey").type).toBe(TOKEN_TYPES.KEY);
			expect(tokens.find(t => t.value === "myVal").type).toBe(TOKEN_TYPES.VALUE);
		});
	});

	describe("4. Reserved Keywords & Modules", () => {
		it("should correctly identify all structural keywords", () => {
			const tokens = tokenize("[import][end] [$use-module][end] [end]");
			expect(tokens.map(t => t.type)).toContain(TOKEN_TYPES.IMPORT);
			expect(tokens.map(t => t.type)).toContain(TOKEN_TYPES.USE_MODULE);
			expect(tokens.map(t => t.type)).toContain(TOKEN_TYPES.END_KEYWORD);
		});
	});

	describe("5. Structural Depth & Nesting", () => {
		it("should track nesting depth correctly for blocks", () => {
			const tokens = tokenize("[a][b][end][end]");
			const aToken = tokens.find(t => t.value === "a");
			const bToken = tokens.find(t => t.value === "b");
			expect(aToken.depth).toBe(1); // Inside [a]
			expect(bToken.depth).toBe(2); // Inside [a][b]
		});

		it("should treat At-Block bodies as shallow text regardless of content", () => {
			const tokens = tokenize("@_raw_@; [nested] @_end_@");
			const textNode = tokens.find(t => t.type === TOKEN_TYPES.TEXT);
			expect(textNode.value.trim()).toBe("[nested]");
			// Standard blocks inside At-Block body are NOT tokenized as structural
			expect(tokens.map(t => t.type)).not.toContain(TOKEN_TYPES.OPEN_BRACKET);
		});
	});

	describe("6. Position Accuracy", () => {
		it("should accurately track character offsets through multiple nodes", () => {
			const src = "[a]TEXT";
			const tokens = tokenize(src);
			const textToken = tokens.find(t => t.type === TOKEN_TYPES.TEXT);
			expect(textToken.range.start.character).toBe(3); // "[a]".length
		});
	});
});
