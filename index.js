import lexer from "./core/lexer.js";
import parser from "./core/parser.js";
import transpiler from "./core/transpiler.js";
import Mapper from "./mappers/mapper.js";
import html from "./mappers/default_mode/smark.html.js";
import markdown from "./mappers/default_mode/smark.md.js";
import mdx from "./mappers/default_mode/smark.mdx.js";
import { runtimeError } from "./core/validator.js";

class SomMark {
	constructor({ src, format, targetFile = null, mode = "default", includeDocument = true }) {
		this.src = src;
		this.format = format;
		this.targetFile = targetFile;
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
			this.targetFile = formats[this.format];
		}
	}
	removeOutput(id) {
		this.targetFile.outputs = this.targetFile.outputs.filter(output => {
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
		return transpiler(ast, this.format, this.targetFile, this.includeDocument);
	}
}
export default SomMark;
