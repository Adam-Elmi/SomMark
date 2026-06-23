import { describe, it, expect } from "vitest";
import lexer from "../../core/lexer.js";
import TOKEN_TYPES from "../../core/tokenTypes.js";

describe("SomMark Lexer Comprehensive Suite", () => {
	const tokenize = (src) => lexer(src);

	describe("1. Literal Characters & Context-Dependent Token Types", () => {
		it("should parse an open bracket as OPEN_BRACKET in structural context", () => {
			const tokens = tokenize("[");
			expect(tokens[0].type).toBe(TOKEN_TYPES.OPEN_BRACKET);
			expect(tokens[0].value).toBe("[");
		});

		it("should parse a close bracket as CLOSE_BRACKET in structural context", () => {
			const tokens = tokenize("[]");
			expect(tokens[1].type).toBe(TOKEN_TYPES.CLOSE_BRACKET);
			expect(tokens[1].value).toBe("]");
		});

		it("should parse the word 'end' as END_KEYWORD when at the start of a block header", () => {
			const tokens = tokenize("[end]");
			expect(tokens[1].type).toBe(TOKEN_TYPES.END_KEYWORD);
			expect(tokens[1].value).toBe("end");
		});

		it("should parse 'import' as IMPORT when at the start of a block header", () => {
			const tokens = tokenize("[import]");
			expect(tokens[1].type).toBe(TOKEN_TYPES.IMPORT);
			expect(tokens[1].value).toBe("import");
		});

		it("should parse '$use-module' as USE_MODULE when at the start of a block header", () => {
			const tokens = tokenize("[$use-module]");
			expect(tokens[1].type).toBe(TOKEN_TYPES.USE_MODULE);
			expect(tokens[1].value).toBe("$use-module");
		});

		it("should parse '=' as EQUAL in structural context", () => {
			const tokens = tokenize("[div =]");
			const equalToken = tokens.find(t => t.type === TOKEN_TYPES.EQUAL);
			expect(equalToken).toBeDefined();
			expect(equalToken.value).toBe("=");
		});

		it("should parse '\"' as QUOTE in structural context", () => {
			const tokens = tokenize("[div = \"val\"]");
			const quoteTokens = tokens.filter(t => t.type === TOKEN_TYPES.QUOTE);
			expect(quoteTokens.length).toBe(2);
			expect(quoteTokens[0].value).toBe("\"");
		});

		it("should parse '->' as TEXT in normal context", () => {
			const tokens = tokenize("->");
			const textToken = tokens.find(t => t.value === "->");
			expect(textToken?.type).toBe(TOKEN_TYPES.TEXT);
		});

		it("should parse '(' and ')' as TEXT in normal context", () => {
			const tokens = tokenize("()");
			expect(tokens[0].type).toBe(TOKEN_TYPES.TEXT);
			expect(tokens[0].value).toBe("()");
		});

		it("should parse ':' as COLON in structural header context", () => {
			const tokens = tokenize("[tag = key: value]");
			const colonToken = tokens.find(t => t.type === TOKEN_TYPES.COLON);
			expect(colonToken).toBeDefined();
			expect(colonToken.value).toBe(":");
		});

		it("should parse ':' as TEXT in normal text context", () => {
			const tokens = tokenize("text: value");
			const textToken = tokens.find(t => t.type === TOKEN_TYPES.TEXT);
			expect(textToken.value).toBe("text: value");
		});

		it("should parse ',' as COMMA in structural header context", () => {
			const tokens = tokenize("[tag = a, b]");
			const commaToken = tokens.find(t => t.type === TOKEN_TYPES.COMMA);
			expect(commaToken).toBeDefined();
			expect(commaToken.value).toBe(",");
		});

		it("should parse ',' as TEXT in normal text context", () => {
			const tokens = tokenize("a, b");
			const textToken = tokens.find(t => t.type === TOKEN_TYPES.TEXT);
			expect(textToken.value).toBe("a, b");
		});

		it("should parse ';' as TEXT in normal text context", () => {
			const tokens = tokenize("a; b");
			const textToken = tokens.find(t => t.type === TOKEN_TYPES.TEXT);
			expect(textToken.value).toBe("a; b");
		});

		it("should parse '!' as EXCLAMATION_MARK in block header context", () => {
			const tokens = tokenize("[br!]");
			const exclToken = tokens.find(t => t.type === TOKEN_TYPES.EXCLAMATION_MARK);
			expect(exclToken).toBeDefined();
			expect(exclToken.value).toBe("!");
		});

		it("should parse '!' as TEXT in normal text context", () => {
			const tokens = tokenize("Danger!");
			const textToken = tokens.find(t => t.type === TOKEN_TYPES.TEXT);
			expect(textToken.value).toBe("Danger!");
		});

		it("should parse Slot Keyword correctly", () => {
			const tokens = tokenize("[slot]");
			expect(tokens[1].type).toBe(TOKEN_TYPES.SLOT_KEYWORD);
		});

		it("should parse For-Each Loop Keyword correctly", () => {
			const tokens = tokenize("[for-each]");
			expect(tokens[1].type).toBe(TOKEN_TYPES.FOR_EACH);
		});
	});

	describe("2. Structural Syntaxes", () => {
		it("should tokenize a complete standard block with body content", () => {
			const tokens = tokenize("[div]Hello World[end]");
			expect(tokens[0].type).toBe(TOKEN_TYPES.OPEN_BRACKET);
			expect(tokens[1].type).toBe(TOKEN_TYPES.IDENTIFIER);
			expect(tokens[1].value).toBe("div");
			expect(tokens[2].type).toBe(TOKEN_TYPES.CLOSE_BRACKET);
			expect(tokens[3].type).toBe(TOKEN_TYPES.TEXT);
			expect(tokens[3].value).toBe("Hello World");
			expect(tokens[4].type).toBe(TOKEN_TYPES.OPEN_BRACKET);
			expect(tokens[5].type).toBe(TOKEN_TYPES.END_KEYWORD);
			expect(tokens[6].type).toBe(TOKEN_TYPES.CLOSE_BRACKET);
		});

		it("should tokenize a self-closing block marked with exclamation", () => {
			const tokens = tokenize("[hr!]");
			expect(tokens[0].type).toBe(TOKEN_TYPES.OPEN_BRACKET);
			expect(tokens[1].type).toBe(TOKEN_TYPES.IDENTIFIER);
			expect(tokens[1].value).toBe("hr");
			expect(tokens[2].type).toBe(TOKEN_TYPES.EXCLAMATION_MARK);
			expect(tokens[3].type).toBe(TOKEN_TYPES.CLOSE_BRACKET);
		});

		it("should tokenize mixed arguments (positional and named)", () => {
			const tokens = tokenize("[tag = \"pos\", key: \"val\"]");
			const keys = tokens.filter(t => t.type === TOKEN_TYPES.KEY);
			const values = tokens.filter(t => t.type === TOKEN_TYPES.VALUE);
			
			expect(keys[0].value).toBe("key");
			expect(values[0].value).toBe("pos");
			expect(values[1].value).toBe("val");
		});

		it("should tokenize parentheses as plain text", () => {
			const tokens = tokenize("(bold content)->(bold)");
			const text = tokens.filter(t => t.type === TOKEN_TYPES.TEXT).map(t => t.value).join("");
			expect(text).toContain("bold content");
			expect(text).toContain("bold");
		});
	});

	describe("3. States & Main Identifier Logic", () => {
		it("should parse 'static' as IDENTIFIER when in main block identifier position", () => {
			const tokens = tokenize("[static]");
			expect(tokens[1].type).toBe(TOKEN_TYPES.IDENTIFIER);
			expect(tokens[1].value).toBe("static");
		});

		it("should parse 'static' as STATIC_KEYWORD when used in argument bindings", () => {
			const tokens = tokenize("[div = key: static ${1}$]");
			const staticKeyword = tokens.find(t => t.type === TOKEN_TYPES.STATIC_KEYWORD);
			expect(staticKeyword).toBeDefined();
		});

		it("should parse 'runtime' as IDENTIFIER when in main block identifier position", () => {
			const tokens = tokenize("[runtime]");
			expect(tokens[1].type).toBe(TOKEN_TYPES.IDENTIFIER);
			expect(tokens[1].value).toBe("runtime");
		});

		it("should parse 'runtime' as RUNTIME_KEYWORD when used in argument bindings", () => {
			const tokens = tokenize("[div = key: runtime ${1}$]");
			const runtimeKeyword = tokens.find(t => t.type === TOKEN_TYPES.RUNTIME_KEYWORD);
			expect(runtimeKeyword).toBeDefined();
		});

		it("should parse compound keyword tags like 'static-tag' as a single IDENTIFIER", () => {
			const tokens = tokenize("[static-tag]");
			expect(tokens[1].type).toBe(TOKEN_TYPES.IDENTIFIER);
			expect(tokens[1].value).toBe("static-tag");
		});

		it("should parse compound keyword tags like 'static_tag' as a single IDENTIFIER", () => {
			const tokens = tokenize("[static_tag]");
			expect(tokens[1].type).toBe(TOKEN_TYPES.IDENTIFIER);
			expect(tokens[1].value).toBe("static_tag");
		});
	});

	describe("4. Edge Cases & Error Handling", () => {
		it("should parse escape characters cleanly inside text", () => {
			const tokens = tokenize("\\(escaped\\)");
			const escapeTokens = tokens.filter(t => t.type === TOKEN_TYPES.ESCAPE);
			expect(escapeTokens.length).toBe(2);
			expect(escapeTokens[0].value).toBe("\\(");
			expect(escapeTokens[1].value).toBe("\\)");
		});

		it("should parse single line comment starting with #", () => {
			const tokens = tokenize("# this is a comment\n[div]");
			expect(tokens[0].type).toBe(TOKEN_TYPES.COMMENT);
			expect(tokens[0].value).toBe("# this is a comment");
		});

		it("should parse multiline comments starting and ending with ###", () => {
			const tokens = tokenize("###\nmultiline comment\n###");
			expect(tokens[0].type).toBe(TOKEN_TYPES.COMMENT_BLOCK);
			expect(tokens[0].value).toBe("###\nmultiline comment\n###");
		});

		it("should emit LOGIC_OPEN and LOGIC without LOGIC_CLOSE when logic block is unclosed", () => {
			const tokens = tokenize("static ${ return 1;");
			const open = tokens.find(t => t.type === TOKEN_TYPES.LOGIC_OPEN);
			const logic = tokens.find(t => t.type === TOKEN_TYPES.LOGIC);
			const close = tokens.find(t => t.type === TOKEN_TYPES.LOGIC_CLOSE);
			expect(open).toBeDefined();
			expect(logic).toBeDefined();
			expect(close).toBeUndefined();
		});

		it("should parse p{} and v{} inside quotes as structured tokens", () => {
			const tokens = tokenize("[div = x: \"prefix p{user} layer v{local} layer\"]");
			const pKeyword = tokens.find(t => t.type === TOKEN_TYPES.PREFIX_P);
			const vKeyword = tokens.find(t => t.type === TOKEN_TYPES.PREFIX_V);
			const pKey = tokens.find(t => t.type === TOKEN_TYPES.KEY && t.value === "user");
			const vKey = tokens.find(t => t.type === TOKEN_TYPES.KEY && t.value === "local");
			expect(pKeyword).toBeDefined();
			expect(pKeyword.value).toBe("p");
			expect(vKeyword).toBeDefined();
			expect(vKeyword.value).toBe("v");
			expect(pKey).toBeDefined();
			expect(vKey).toBeDefined();
			const prefixCloses = tokens.filter(t => t.type === TOKEN_TYPES.PREFIX_CLOSE);
			expect(prefixCloses.length).toBe(2);
		});

		it("should parse v{} layers in block headers and normal text as structured tokens", () => {
			// Header
			const headerTokens = tokenize("[div = x: v{varInHeader}]");
			const headerV = headerTokens.find(t => t.type === TOKEN_TYPES.PREFIX_V);
			const headerKey = headerTokens.find(t => t.type === TOKEN_TYPES.KEY && t.value === "varInHeader");
			expect(headerV).toBeDefined();
			expect(headerV.value).toBe("v");
			expect(headerKey).toBeDefined();

			// Normal text
			const textTokens = tokenize("Welcome v{user}!");
			const textV = textTokens.find(t => t.type === TOKEN_TYPES.PREFIX_V);
			const textKey = textTokens.find(t => t.type === TOKEN_TYPES.KEY && t.value === "user");
			expect(textV).toBeDefined();
			expect(textV.value).toBe("v");
			expect(textKey).toBeDefined();
		});
	});

	describe("5. Whitespace Handling", () => {
		it("should group contiguous horizontal whitespace into a single token", () => {
			const tokens = tokenize("   \t  \r ");
			expect(tokens.length).toBe(2); // WHITESPACE + EOF
			expect(tokens[0].type).toBe(TOKEN_TYPES.WHITESPACE);
			expect(tokens[0].value).toBe("   \t  \r ");
		});

		it("should tokenize newline characters individually without grouping", () => {
			const tokens = tokenize("\n\n");
			expect(tokens.length).toBe(3); // WHITESPACE (\n) + WHITESPACE (\n) + EOF
			expect(tokens[0].type).toBe(TOKEN_TYPES.WHITESPACE);
			expect(tokens[0].value).toBe("\n");
			expect(tokens[1].type).toBe(TOKEN_TYPES.WHITESPACE);
			expect(tokens[1].value).toBe("\n");
		});

		it("should handle structural whitespace around block headers without affecting states", () => {
			const tokens = tokenize(" \t [ \t div \t = \t ] \t ");
			const wsTokens = tokens.filter(t => t.type === TOKEN_TYPES.WHITESPACE);
			
			expect(wsTokens[0].value).toBe(" \t ");
			expect(wsTokens[1].value).toBe(" \t ");
			expect(wsTokens[2].value).toBe(" \t ");
			expect(wsTokens[3].value).toBe(" \t ");
			expect(wsTokens[4].value).toBe(" \t ");
		});
	});
});