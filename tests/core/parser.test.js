import { describe, it, expect } from "vitest";
import SomMark, { parseSync } from "../../index.js";
import parser from "../../core/parser.js";
import lexer from "../../core/lexer.js";
import {
	BLOCK,
	TEXT,
	INLINE,
	ATBLOCK,
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
			expect(ast[0].args.src).toBe("logo.png");
		});

		it("parses standard At-Blocks containing literal text and extracts the raw content", () => {
			const ast = parseSync("@_code_@;const x = 1;@_end_@");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: ATBLOCK,
				id: "code",
				content: "const x = 1;",
				depth: 1
			});
		});

		it("parses At-Blocks with arguments and extracts metadata correctly", () => {
			const ast = parseSync("@_code_@: lang: \"javascript\";console.log(42);@_end_@");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: ATBLOCK,
				id: "code",
				content: "console.log(42);",
				depth: 1
			});
			expect(ast[0].args.lang).toBe("javascript");
		});

		it("parses inline spans using colon syntax for argument assignment", () => {
			const ast = parseSync("(Click)->(link: \"/url\")");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: INLINE,
				id: "link",
				value: "Click",
				depth: 1
			});
			expect(ast[0].args["0"]).toBe("/url");
		});

		it("parses inline spans using equals syntax for argument assignment", () => {
			const ast = parseSync("(Click)->(link = \"/url\")");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: INLINE,
				id: "link",
				value: "Click",
				depth: 1
			});
			expect(ast[0].args["0"]).toBe("/url");
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
			expect(ast[0].args["0"]).toBe("./Card.smark");
			expect(ast[0].args["Card"]).toBe("./Card.smark");
		});

		it("parses module usage syntax as USE_MODULE node type", () => {
			const ast = parseSync("[$use-module = Card][end]");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: USE_MODULE,
				id: "$use-module",
				depth: 1
			});
			expect(ast[0].args["0"]).toBe("Card");
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
			expect(ast[0].args.as).toBe("item");
			expect(ast[0].args["0"]).toMatchObject({
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

		it("includes nested inline formatting spans in parent block bodies", () => {
			const ast = parseSync("[p]Word (bold)->(b) word[end]");
			const block = ast[0];
			expect(block.body.length).toBe(4);
			expect(block.body[0]).toMatchObject({ type: TEXT, text: "Word " });
			expect(block.body[1]).toMatchObject({
				type: INLINE,
				id: "b",
				value: "bold"
			});
			expect(block.body[2]).toMatchObject({ type: TEXT, text: " " });
			expect(block.body[3]).toMatchObject({ type: TEXT, text: "word" });
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
			expect(ast[0].args.class).toBe("card");
			expect(ast[0].args.id).toBe("my-card");
			expect(ast[0].body[0].text).toBe("content");
		});

		it("preserves block tags, inlines, and comments literally inside At-Blocks without parsing them", () => {
			const ast = parseSync("@_code_@; [div] (hello)->(span) # comment @_end_@");
			expect(ast.length).toBe(1);
			expect(ast[0].type).toBe(ATBLOCK);
			expect(ast[0].id).toBe("code");
			expect(ast[0].content).toBe(" [div] (hello)->(span) # comment ");
			expect(ast[0].body).toBeUndefined();
		});
	});

	describe("3. Argument Handling Strategy", () => {
		it("parses positional arguments by mapping them to incremental numeric keys", () => {
			const ast = parseSync("[tag = \"pos1\", \"pos2\"][end]");
			expect(ast[0].args["0"]).toBe("pos1");
			expect(ast[0].args["1"]).toBe("pos2");
		});

		it("parses named arguments by mapping them to their key names", () => {
			const ast = parseSync("[tag = color: \"red\", size: 10][end]");
			expect(ast[0].args.color).toBe("red");
			expect(ast[0].args.size).toBe("10");
		});

		it("parses mixed arguments with both positional and named key mappings", () => {
			const ast = parseSync("[tag = \"fluid\", color: \"blue\"][end]");
			expect(ast[0].args["0"]).toBe("fluid");
			expect(ast[0].args.color).toBe("blue");
		});

		it("resolves native JavaScript objects inside js{} expressions through safe parser", () => {
			const ast = parseSync("[tag = options: js{{ active: true, list: [1, 2] }}][end]");
			expect(ast[0].args.options).toMatchObject({
				active: true,
				list: [1, 2]
			});
		});

		it("replaces resolved placeholders and preserves unresolved placeholder envelopes in arguments", () => {
			const placeholders = { apiHost: "https://api.site.com" };
			const smark = new SomMark({
				src: "[tag = host: p{apiHost}, extra: p{unresolved}][end]",
				format: "html",
				placeholders
			});
			const ast = smark.parseSync();
			expect(ast[0].args.host).toBe("https://api.site.com");
			expect(ast[0].args.extra).toBe("SOMMARK_UNRESOLVED_p_unresolved_SOMMARK");
		});

		it("substitutes local variables in v{} expressions and registers them in the consumption list", () => {
			const tokens = lexer("[tag = user: v{username}, age: v{userage}][end]", "anon.smark");
			const variables = { username: "Adam" };

			const ast = parser(tokens, "anon.smark", {}, variables);
			expect(ast[0].args.user).toBe("Adam");
			expect(ast[0].args.age).toBe("SOMMARK_UNRESOLVED_v_userage_SOMMARK");
			
			// Verify tracking mechanism
			expect(variables.__consumed__).toBeDefined();
			expect(variables.__consumed__.has("username")).toBe(true);
			expect(variables.__consumed__.has("userage")).toBe(false);
		});

		it("constructs specialized logic argument nodes when logic blocks are passed inside headers", () => {
			const ast = parseSync("[tag = init: static \${ 1 + 2 }$, run: runtime \${ callback() }$][end]");
			expect(ast[0].args.init.type).toBe(STATIC_LOGIC);
			expect(ast[0].args.init.code).toBe(" 1 + 2 ");
			expect(ast[0].args.run.type).toBe(RUNTIME_LOGIC);
			expect(ast[0].args.run.code).toBe(" callback() ");
		});
	});

	describe("4. Error Checking, Syntax Gatekeepers & Typo Recovery", () => {
		it("throws an error when a block header is missing its closing structural bracket", () => {
			expect(() => parseSync("[div = key: \"val\"")).toThrow(/Expected.*\]/i);
		});

		it("throws an error when a block fails to terminate with a matching [end]", () => {
			expect(() => parseSync("[div]unclosed body")).toThrow(/Missing '\[end\]'/);
		});

		it("throws an error when an At-Block is missing its closing @_end_@ marker", () => {
			expect(() => parseSync("@_code_@; content")).toThrow(/Missing AtBlock Identifier|content|end/);
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

		it("throws an error when identifier names contain forbidden special characters", () => {
			expect(() => parseSync("(hello)->(div.tag)")).toThrow(/invalid/i);
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
			const ast = parseSync("Escaped \\[block\\] and \\(parenthesis\\).");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: TEXT,
				text: "Escaped [block] and (parenthesis)."
			});
		});

		it("restores escaped arrows inside inline spans to their plain characters", () => {
			const ast = parseSync("(Function uses \\-> operator)->(code)");
			expect(ast.length).toBe(1);
			expect(ast[0]).toMatchObject({
				type: INLINE,
				id: "code",
				value: "Function uses -> operator"
			});
		});

		it("degrades standalone unmatched parenthesis to plain text elements rather than crashing", () => {
			const ast = parseSync("Standalone (unmatched text) here.");
			expect(ast.length).toBe(5);
			expect(ast[0]).toMatchObject({ type: TEXT, text: "Standalone " });
			expect(ast[1]).toMatchObject({ type: TEXT, text: "(" });
			expect(ast[2]).toMatchObject({ type: TEXT, text: "unmatched text" });
			expect(ast[3]).toMatchObject({ type: TEXT, text: ")" });
			expect(ast[4]).toMatchObject({ type: TEXT, text: " here." });
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
});
