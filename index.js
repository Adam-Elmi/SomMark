import lexer from "./core/lexer.js";
import parser from "./core/parser.js";
import transpiler from "./core/transpiler.js";
import Mapper from "./mappers/mapper.js";
import html from "./mappers/default_mode/smark.html.js";
import markdown from "./mappers/default_mode/smark.md.js";
import mdx from "./mappers/default_mode/smark.mdx.js";
import TagBuilder from "./formatter/tag.js";
import MarkdownBuilder from "./formatter/mark.js";
import { runtimeError } from "./core/errors.js";
import { loadStyle } from "./helpers/loadStyle.js";

class SomMark {
	constructor({ src, format, mapperFile = null, mode = "default", includeDocument = true }) {
		this.src = src;
		this.format = format;
		this.mapperFile = mapperFile;
		this.mode = mode;
		this.Mapper = Mapper;
		this.includeDocument = includeDocument;
		const accepted_formats = ["html", "md", "mdx"];
		if (!this.format) {
			runtimeError(["{line}<$red:Undefined Format$>: <$yellow:Format argument is not defined.$>{line}"]);
		}
		if (this.format && !accepted_formats.includes(this.format)) {
			runtimeError([
				`{line}<$red:Unknown Format$>: <$yellow:You provided unknown format:$> <$green:'${format}'$>`,
				`{N}<$yellow:Accepted formats are:$> [<$cyan: ${accepted_formats.join(", ")}$>]{line}`
			]);
		}
		const formats = { html, md: markdown, mdx };
		if (mode === "default" && this.format) {
			this.mapperFile = formats[this.format];
		}
	}
	removeOutput(id) {
		this.mapperFile.outputs = this.mapperFile.outputs.filter(output => {
			if (Array.isArray(output.id)) {
				return !output.id.some(singleId => singleId === id);
			} else {
				return output.id !== id;
			}
		});
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
		return transpiler({ ast, format: this.format, mapperFile: this.mapperFile, includeDocument: this.includeDocument });
	}
}

const lex = src => lexer(src);

function parse(src) {
	if (!src) {
		runtimeError([
			`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for parsing.$>{line}`
		]);
	}
	const tokens = lex(src);
	if (!Array.isArray(tokens) || tokens.length === 0) {
		runtimeError([
			`{line}<$red:Invalid tokens:$> <$yellow:Expecting a non-empty array of tokens.$>{line}`
		]);
	}
	return parser(tokens);
}

function transpile(options = {}) {
	const { src, format = "html", mapperFile = html, includeDocument = true } = options;
	if (typeof options !== 'object' || options === null) {
		runtimeError([
			`{line}<$red:Invalid Options:$> <$yellow:The options argument must be a non-null object.$>{line}`
		]);
	}
	const knownProps = ["src", "format", "mapperFile", "includeDocument"];
	Object.keys(options).forEach(key => {
		if (!knownProps.includes(key)) {
			runtimeError([
				`{line}<$red:Unknown Property:$> <$yellow:The property $> <$green:'${key}'$> <$yellow:is not recognized.$>{line}`
			]);
		}
	});
	if (!src) {
		runtimeError([
			`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for transpilation.$>{line}`
		]);
	}
	const ast = parse(src);
	if (!Array.isArray(ast) || ast.length === 0) {
		runtimeError([
			`{line}<$red:Invalid AST:$> <$yellow:Transpiler expected a non-empty array AST.$>{line}`
		]);
	}
	return transpiler({ ast, format, mapperFile, includeDocument });
}

export { html, markdown, mdx, Mapper, TagBuilder, MarkdownBuilder, lex, parse, transpile, loadStyle };
export default SomMark;
