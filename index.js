import lexer from "./core/lexer.js";
import parser from "./core/parser.js";
import transpiler from "./core/transpiler.js";
import Mapper from "./mappers/mapper.js";
import html from "./mappers/default_mode/smark.html.js";
import markdown from "./mappers/default_mode/smark.md.js";
import mdx from "./mappers/default_mode/smark.mdx.js";

class SomMark {
	constructor(src, format, targetFile = null, mode = "default") {
		this.src = src;
		this.format = format;
		this.targetFile = targetFile;
		this.mode = mode;
		this.Mapper = Mapper;
		if (mode === "default" && this.format) {
			const formats = { html, md: markdown, mdx };
			this.targetFile = formats[this.format];
		}
	}
	lex() {
		return lexer(this.src);
	}
	parse() {
		const tokens = this.lex();
		return parser(tokens);
	}
	transpile() {
		const ast = this.parse();
		return transpiler(ast, this.format, this.targetFile);
	}
}
