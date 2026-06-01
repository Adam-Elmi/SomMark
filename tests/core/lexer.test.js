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

		it("should parse an open bracket as TEXT inside an At-Block body", () => {
			const tokens = tokenize("@_raw_@; [ @_end_@");
			const textToken = tokens.find(t => t.type === TOKEN_TYPES.TEXT);
			expect(textToken.value).toBe(" [ ");
		});

		it("should parse a close bracket as CLOSE_BRACKET in structural context", () => {
			const tokens = tokenize("[]");
			expect(tokens[1].type).toBe(TOKEN_TYPES.CLOSE_BRACKET);
			expect(tokens[1].value).toBe("]");
		});

		it("should parse a close bracket as TEXT inside an At-Block body", () => {
			const tokens = tokenize("@_raw_@; ] @_end_@");
			const textToken = tokens.find(t => t.type === TOKEN_TYPES.TEXT);
			expect(textToken.value).toBe(" ] ");
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

		it("should parse '=' as TEXT inside an At-Block body", () => {
			const tokens = tokenize("@_raw_@; = @_end_@");
			const textToken = tokens.find(t => t.type === TOKEN_TYPES.TEXT);
			expect(textToken.value).toBe(" = ");
		});

		it("should parse '\"' as QUOTE in structural context", () => {
			const tokens = tokenize("[div = \"val\"]");
			const quoteTokens = tokens.filter(t => t.type === TOKEN_TYPES.QUOTE);
			expect(quoteTokens.length).toBe(2);
			expect(quoteTokens[0].value).toBe("\"");
		});

		it("should parse '->' as THIN_ARROW in normal context", () => {
			const tokens = tokenize("->");
			expect(tokens[0].type).toBe(TOKEN_TYPES.THIN_ARROW);
			expect(tokens[0].value).toBe("->");
		});

		it("should parse '->' as TEXT inside At-Block bodies", () => {
			const tokens = tokenize("@_raw_@; -> @_end_@");
			const textToken = tokens.find(t => t.type === TOKEN_TYPES.TEXT);
			expect(textToken.value).toBe(" -> ");
		});

		it("should parse '(' as OPEN_PAREN when opening an inline span or inline head", () => {
			const tokens = tokenize("()");
			expect(tokens[0].type).toBe(TOKEN_TYPES.OPEN_PAREN);
			expect(tokens[0].value).toBe("(");
		});

		it("should parse '(' as TEXT inside At-Block bodies", () => {
			const tokens = tokenize("@_raw_@; ( @_end_@");
			const textToken = tokens.find(t => t.type === TOKEN_TYPES.TEXT);
			expect(textToken.value).toBe(" ( ");
		});

		it("should parse ')' as TEXT when standalone and not closing parentheses", () => {
			const tokens = tokenize(")");
			expect(tokens[0].type).toBe(TOKEN_TYPES.TEXT);
			expect(tokens[0].value).toBe(")");
		});

		it("should parse ')' as CLOSE_PAREN when closing an open paren", () => {
			const tokens = tokenize("()");
			expect(tokens[1].type).toBe(TOKEN_TYPES.CLOSE_PAREN);
			expect(tokens[1].value).toBe(")");
		});

		it("should parse '@_' as OPEN_AT and '_@' as CLOSE_AT", () => {
			const tokens = tokenize("@_code_@");
			expect(tokens[0].type).toBe(TOKEN_TYPES.OPEN_AT);
			expect(tokens[2].type).toBe(TOKEN_TYPES.CLOSE_AT);
		});

		it("should parse '@_' and '_@' as TEXT inside At-Block bodies when escaped", () => {
			const tokens = tokenize("@_code_@; \\@_ \\_@ @_end_@");
			const textToken = tokens.find(t => t.type === TOKEN_TYPES.TEXT);
			expect(textToken.value).toContain("@_ _@");
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

		it("should parse ';' as SEMICOLON in At-Block header context", () => {
			const tokens = tokenize("@_code_@;");
			const semiToken = tokens.find(t => t.type === TOKEN_TYPES.SEMICOLON);
			expect(semiToken).toBeDefined();
			expect(semiToken.value).toBe(";");
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

		it("should tokenize inline spans mapping to formatting tags", () => {
			const tokens = tokenize("(bold content)->(bold)");
			// Left hand parenthesized body is parsed as TEXT
			const leftContent = tokens.find(t => t.value === "bold content");
			expect(leftContent.type).toBe(TOKEN_TYPES.TEXT);
			
			// Thin arrow separator
			expect(tokens.find(t => t.type === TOKEN_TYPES.THIN_ARROW)).toBeDefined();
			
			// Right hand tag name is parsed as IDENTIFIER
			const rightId = tokens.find(t => t.value === "bold");
			expect(rightId.type).toBe(TOKEN_TYPES.IDENTIFIER);
		});

		it("should tokenize an At-Block with dynamic arguments", () => {
			const tokens = tokenize("@_code_@: lang: \"js\";\nconst x = 1;\n@_end_@");
			expect(tokens[0].type).toBe(TOKEN_TYPES.OPEN_AT);
			expect(tokens[1].type).toBe(TOKEN_TYPES.IDENTIFIER); // code
			expect(tokens[2].type).toBe(TOKEN_TYPES.CLOSE_AT);
			expect(tokens[3].type).toBe(TOKEN_TYPES.COLON);
			expect(tokens[4].type).toBe(TOKEN_TYPES.WHITESPACE);
			expect(tokens[5].type).toBe(TOKEN_TYPES.KEY); // lang
			
			// Semicolon separator
			const semi = tokens.find(t => t.type === TOKEN_TYPES.SEMICOLON);
			expect(semi).toBeDefined();
			
			// At-Block raw body text
			const bodyText = tokens.find(t => t.value.includes("const x = 1;"));
			expect(bodyText.type).toBe(TOKEN_TYPES.TEXT);
			
			// Ending structure
			expect(tokens.find(t => t.type === TOKEN_TYPES.END_KEYWORD)).toBeDefined();
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

		it("should throw a lexer error when logic block is unclosed", () => {
			expect(() => tokenize("static ${ return 1;")).toThrow();
		});

		it("should parse nested braces inside prefix layers", () => {
			const tokens = tokenize("[div = x: js{{a: {b: 1}}}]");
			const jsToken = tokens.find(t => t.type === TOKEN_TYPES.PREFIX_JS);
			expect(jsToken).toBeDefined();
			expect(jsToken.value).toBe("js{{a: {b: 1}}}");
		});

		it("should parse prefix layers inside quotes", () => {
			const tokens = tokenize("[div = x: \"prefix p{user} layer v{local} layer\"]");
			const pToken = tokens.find(t => t.type === TOKEN_TYPES.PREFIX_P);
			const vToken = tokens.find(t => t.type === TOKEN_TYPES.PREFIX_V);
			expect(pToken).toBeDefined();
			expect(pToken.value).toBe("p{user}");
			expect(vToken).toBeDefined();
			expect(vToken.value).toBe("v{local}");
		});

		it("should parse v{} layers in block headers and normal text", () => {
			// Header
			const headerTokens = tokenize("[div = x: v{varInHeader}]");
			const headerV = headerTokens.find(t => t.type === TOKEN_TYPES.PREFIX_V);
			expect(headerV).toBeDefined();
			expect(headerV.value).toBe("v{varInHeader}");

			// Normal text
			const textTokens = tokenize("Welcome v{user}!");
			const textV = textTokens.find(t => t.type === TOKEN_TYPES.PREFIX_V);
			expect(textV).toBeDefined();
			expect(textV.value).toBe("v{user}");
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