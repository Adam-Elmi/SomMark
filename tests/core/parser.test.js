import { describe, it, expect } from "vitest";
import SomMark, { parseSync } from "../../index.js";
import parser from "../../core/parser.js";
import lexer from "../../core/lexer.js";
import {
	BLOCK,
	TEXT,
	COMMENT,
	COMMENT_BLOCK,
	IMPORT,
	USE_MODULE,
	SLOT,
	STATIC_LOGIC,
	RUNTIME_LOGIC,
	FOR_EACH
} from "../../core/labels.js";

describe("SomMark Parser Comprehensive Suite", () => {
	describe("1. Valid Structural Entities & Core Keywords", () => {
		it("parses a standard block with plain text body and records correct properties", () => {
			const ast = parseSync("[div]Hello World[end]");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: BLOCK,
				id: "div",
				depth: 1
			});
			expect(ast[0].body[0]).toMatchObject({
				type: TEXT,
				text: "Hello World",
				depth: 2
			});
		});

		it("parses standard self-closing blocks marked with exclamation points", () => {
			const ast = parseSync("[br!]");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: BLOCK,
				id: "br",
				isSelfClosing: true,
				depth: 1,
				body: []
			});
		});

		it("parses self-closing blocks with arguments cleanly", () => {
			const ast = parseSync("[img = src: \"logo.png\" !]");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: BLOCK,
				id: "img",
				isSelfClosing: true,
				depth: 1
			});
			expect(ast[0].props.src).toBe("logo.png");
		});

		it("parses single-line comments and maps them to comment nodes with clean text", () => {
			const ast = parseSync("# Hello comment\n[div][end]");
			expect(ast[0]).toMatchObject({
				type: COMMENT,
				text: "Hello comment",
				depth: 1
			});
		});

		it("parses multiline block comments and preserves internal line break structure", () => {
			const ast = parseSync("###\nHello multiline\ncomment\n###");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: COMMENT_BLOCK,
				text: "Hello multiline\ncomment",
				depth: 1
			});
		});

		it("parses standalone static logic blocks into specialized logic nodes", () => {
			const ast = parseSync("static ${ 1 + 2 }$");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: STATIC_LOGIC,
				code: " 1 + 2 ",
				depth: 1
			});
		});

		it("parses standalone runtime logic blocks into specialized logic nodes", () => {
			const ast = parseSync("runtime ${ alert() }$");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: RUNTIME_LOGIC,
				code: " alert() ",
				depth: 1
			});
		});

		it("parses module import syntax as IMPORT node type with assigned properties", () => {
			const ast = parseSync("[import = Card: \"./Card.smark\"][end]");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: IMPORT,
				id: "import",
				depth: 1
			});
			expect(ast[0].props["0"]).toBe("./Card.smark");
			expect(ast[0].props["Card"]).toBe("./Card.smark");
		});

		it("parses module usage syntax as USE_MODULE node type", () => {
			const ast = parseSync("[$use-module = Card][end]");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: USE_MODULE,
				id: "$use-module",
				depth: 1
			});
			expect(ast[0].props["0"]).toBe("Card");
		});

		it("parses slot elements as SLOT node type", () => {
			const ast = parseSync("[slot][end]");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: SLOT,
				id: "slot",
				depth: 1
			});
		});

		it("parses structural loops as FOR_EACH node type with loop variables", () => {
			const ast = parseSync("[for-each = static ${ items }$, as: \"item\"]body[end]");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: FOR_EACH,
				id: "for-each",
				depth: 1
			});
			expect(ast[0].props.as).toBe("item");
			expect(ast[0].props["0"]).toMatchObject({
				type: STATIC_LOGIC,
				code: " items "
			});
		});
	});

	describe("2. Deep Nesting & Hierarchy Tracking", () => {
		it("calculates and increments depth numbers precisely for deeply nested blocks", () => {
			const ast = parseSync("[section][div][p]Deep[end][end][end]");
			expect(ast[0].id).toBe("section");
			expect(ast[0].depth).toBe(1);

			expect(ast[0].body[0].id).toBe("div");
			expect(ast[0].body[0].depth).toBe(2);

			expect(ast[0].body[0].body[0].id).toBe("p");
			expect(ast[0].body[0].body[0].depth).toBe(3);

			expect(ast[0].body[0].body[0].body[0]).toMatchObject({
				type: TEXT,
				text: "Deep",
				depth: 4
			});
		});

		it("skips horizontal whitespace and comments inside headers as structural junk", () => {
			const ast = parseSync(`[
				div              # Tag name
				=                # Equal sign
				class: "card",   # Argument 1
				id: "my-card"    # Argument 2
			]content[end]`);

			expect(ast.length).toBe(1);
			expect(ast[0].id).toBe("div");
			expect(ast[0].props.class).toBe("card");
			expect(ast[0].props.id).toBe("my-card");
			expect(ast[0].body[0].text).toBe("content");
		});

	});

	describe("3. Argument Handling Strategy", () => {
		it("parses positional arguments by mapping them to incremental numeric keys", () => {
			const ast = parseSync("[tag = \"pos1\", \"pos2\"][end]");
			expect(ast[0].props["0"]).toBe("pos1");
			expect(ast[0].props["1"]).toBe("pos2");
		});

		it("parses named arguments by mapping them to their key names", () => {
			const ast = parseSync("[tag = color: \"red\", size: 10][end]");
			expect(ast[0].props.color).toBe("red");
			expect(ast[0].props.size).toBe("10");
		});

		it("parses mixed arguments with both positional and named key mappings", () => {
			const ast = parseSync("[tag = \"fluid\", color: \"blue\"][end]");
			expect(ast[0].props["0"]).toBe("fluid");
			expect(ast[0].props.color).toBe("blue");
		});

		it("replaces resolved placeholders and preserves unresolved placeholder envelopes in arguments", () => {
			const placeholders = { apiHost: "https://api.site.com" };
			const smark = new SomMark({
				src: "[tag = host: p{apiHost}, extra: p{unresolved}][end]",
				format: "html",
				placeholders
			});
			const ast = smark.parseSync();
			expect(ast[0].props.host).toBe("https://api.site.com");
			expect(ast[0].props.extra).toBe("SOMMARK_UNRESOLVED_p_unresolved_SOMMARK");
		});

		it("substitutes local variables in v{} expressions and registers them in the consumption list", () => {
			const tokens = lexer("[tag = user: v{username}, age: v{userage}][end]", "anon.smark");
			const variables = { username: "Adam" };

			const ast = parser(tokens, "anon.smark", {}, variables);
			expect(ast[0].props.user).toBe("Adam");
			expect(ast[0].props.age).toBe("SOMMARK_UNRESOLVED_v_userage_SOMMARK");
			
			// Verify tracking mechanism
			expect(variables.__consumed__).toBeDefined();
			expect(variables.__consumed__.has("username")).toBe(true);
			expect(variables.__consumed__.has("userage")).toBe(false);
		});

		it("constructs specialized logic argument nodes when logic blocks are passed inside headers", () => {
			const ast = parseSync("[tag = init: static \${ 1 + 2 }$, run: runtime \${ callback() }$][end]");
			expect(ast[0].props.init.type).toBe(STATIC_LOGIC);
			expect(ast[0].props.init.code).toBe(" 1 + 2 ");
			expect(ast[0].props.run.type).toBe(RUNTIME_LOGIC);
			expect(ast[0].props.run.code).toBe(" callback() ");
		});
	});

	describe("4. Error Checking, Syntax Gatekeepers & Typo Recovery", () => {
		it("throws an error when a block header is missing its closing structural bracket", () => {
			expect(() => parseSync("[div = key: \"val\"")).toThrow(/Expected.*\]/i);
		});

		it("throws an error when a block fails to terminate with a matching [end]", () => {
			expect(() => parseSync("[div]unclosed body")).toThrow(/Missing '\[end\]'/);
		});

		it("throws an error when a quoted string value contains unmatched quotes", () => {
			expect(() => parseSync("[div = arg: \"unclosed][end]")).toThrow(/Unclosed quote/);
		});

		it("throws a nested slot restriction error when a slot element is nested inside another", () => {
			expect(() => parseSync("[slot][slot][end][end]")).toThrow(/Nested slots are not allowed/);
		});

		it("throws a syntax error when a trailing comma or separator exists inside headers", () => {
			expect(() => parseSync("[div = arg: \"val\", ][end]")).toThrow(/Unexpected trailing separator/);
		});

		it("throws a syntax error when a colon or equal sign lacks an argument value", () => {
			expect(() => parseSync("[div = key: ][end]")).toThrow(/Missing value/);
		});

		it("throws a parser error when reserved core keywords are registered as custom block identifiers", () => {
			expect(() => parseSync("[end!]")).toThrow(/reserved/i);
		});

		it("suggests the correct [end] keyword when encountering near-match typos near EOF", () => {
			expect(() => parseSync("[div]content[ed]")).toThrow(/Did you mean.*\[end\]/);
		});
	});

	describe("5. Edge Cases", () => {
		it("converts escaped structural characters inside block text back to their plain literals", () => {
			const ast = parseSync("Escaped \\[block\\].");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: TEXT,
				text: "Escaped [block]."
			});
		});

		it("tracks lines and columns precisely for range spans of multiline structures", () => {
			const ast = parseSync("[div]\nLine 1\nLine 2\n[end]");
			expect(ast[0].range.start.line).toBe(0);
			expect(ast[0].range.end.line).toBe(3);
		});

		it("treats logic block keywords as plain text when not followed by dynamic logic delimiters", () => {
			const ast = parseSync("This is static content with runtime words.");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: TEXT,
				text: "This is static content with runtime words."
			});
		});
	});

	describe("9. Named Closing Tags [end:blockname]", () => {
		it("accepts [end:blockname] when it matches the open block", () => {
			const ast = parseSync("[div]Hello[end:div]");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({ type: BLOCK, id: "div" });
			expect(ast[0].body[0]).toMatchObject({ type: TEXT, text: "Hello" });
		});

		it("bare [end] still closes any block unchanged", () => {
			const ast = parseSync("[section]content[end]");
			expect(ast[0].id).toBe("section");
		});

		it("mixes [end:name] and bare [end] across nesting levels", () => {
			const ast = parseSync("[article][p]text[end:p][end]");
			expect(ast[0].id).toBe("article");
			expect(ast[0].body[0]).toMatchObject({ type: BLOCK, id: "p" });
		});

		it("named closing works at multiple nesting levels", () => {
			const ast = parseSync("[div][section][p]deep[end:p][end:section][end:div]");
			expect(ast[0].id).toBe("div");
			expect(ast[0].body[0].id).toBe("section");
			expect(ast[0].body[0].body[0].id).toBe("p");
		});

		it("throws a clear error when [end:name] mismatches the open block", () => {
			expect(() => parseSync("[div]hello[end:span]")).toThrow(/end:span.*div|div.*end:span/i);
		});

		it("error message includes both the wrong name and the correct open block name", () => {
			let msg = "";
			try { parseSync("[section]text[end:article]"); } catch (e) { msg = String(e); }
			expect(msg).toMatch(/section/);
			expect(msg).toMatch(/article/);
		});

		it("error message includes the line number of the open block", () => {
			let msg = "";
			try { parseSync("[outer]\n  [inner]text[end:outer]"); } catch (e) { msg = String(e); }
			expect(msg).toMatch(/inner/);
			expect(msg).toMatch(/outer/);
		});

		it("throws when block name is missing after end:", () => {
			expect(() => parseSync("[div]text[end:]")).toThrow();
		});
	});
});
