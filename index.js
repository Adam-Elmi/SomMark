import lexer from "./core/lexer.js";
import parser from "./core/parser.js";
import transpiler from "./core/transpiler.js";
import Mapper from "./mappers/mapper.js";
import HTML from "./mappers/languages/html.js";
import MARKDOWN from "./mappers/languages/markdown.js";
import MDX from "./mappers/languages/mdx.js";
import Json from "./mappers/languages/json.js";
import XML from "./mappers/languages/xml.js";
import { runtimeError } from "./core/errors.js";
import FORMATS, { textFormat, htmlFormat, markdownFormat, mdxFormat, jsonFormat, xmlFormat } from "./core/formats.js";
import TOKEN_TYPES from "./core/tokenTypes.js";
import * as labels from "./core/labels.js";
import { resolveModules } from "./core/modules.js";
import { formatAST } from "./core/formatter.js";
import { validateAST } from "./core/validator.js";
import { enableColor } from "./helpers/colorize.js";
import { safeArg } from "./helpers/utils.js";


/**
 * The SomMark Core Engine.
 * Processes SomMark code and turns it into different formats.
 */
class SomMark {
	static Mapper = Mapper;
	/**
	 * Creates a new SomMark engine.
	 * 
	 * @param {Object} options - Settings for the engine.
	 * @param {string} options.src - The SomMark code to process.
	 * @param {string} options.format - The final format you want (like 'html' or 'markdown').
	 * @param {Mapper|null} [options.mapperFile=null] - Custom rules for formatting.
	 * @param {string} [options.filename="anonymous"] - The name of the file, used for errors and settings.
	 * @param {boolean} [options.removeComments=true] - If true, comments will be removed from the final code.
	 * @param {Object} [options.placeholders={}] - Values to use for {placeholders}.
	 * @param {Object} [options.placeholder={}] - Alias for placeholders (backward compatibility).
	 * @param {Array<string>} [options.customProps=[]] - Allowed custom HTML attributes.
	 * @param {Array<string>} [options.importStack=[]] - Tracking for circular dependencies.
	 */
	constructor({ src, format, mapperFile = null, filename = "anonymous", removeComments = true, placeholder = {}, placeholders = {}, customProps = [], importStack = [] }) {
		this.src = src;
		this.targetFormat = format;
		this.mapperFile = mapperFile;
		this.filename = filename;
		this.removeComments = removeComments;
		this.placeholders = { ...placeholder, ...placeholders };
		this.customProps = customProps;
		this.importStack = importStack;
		this.warnings = [];
		this._prepared = false;

		// Create a random token to safely wrap data
		this.moduleIdentityToken = `$_SM_MOD_${Math.random().toString(36).slice(2, 7)}_$`;

		this.Mapper = Mapper;

		const mapperFiles = { [htmlFormat]: HTML, [markdownFormat]: MARKDOWN, [mdxFormat]: MDX, [jsonFormat]: Json, [xmlFormat]: XML, [textFormat]: new Mapper() };

		if (!this.mapperFile && this.targetFormat) {
			const DefaultMapper = mapperFiles[this.targetFormat];
			if (DefaultMapper) {
				this.mapperFile = DefaultMapper.clone();
			}
		} else if (this.mapperFile) {
			this.mapperFile = this.mapperFile.clone();
		}

		if (this.mapperFile) {
			this.mapperFile.options.removeComments = this.removeComments;
			this.mapperFile.options.moduleIdentityToken = this.moduleIdentityToken;
			this.mapperFile.options.filename = this.filename;

			// Initialize custom props whitelist
			if (this.customProps && this.customProps.length > 0) {
				const props = Array.isArray(this.customProps) ? this.customProps : [this.customProps];
				props.forEach(prop => this.mapperFile.customProps.add(prop));
			}
		}

		this._initializeMappers();
	}

	/**
	 * Backward compatibility alias for placeholders.
	 */
	get placeholder() {
		return this.placeholders;
	}

	set placeholder(val) {
		this.placeholders = val;
	}

	/**
	 * Adds a new rule or changes an existing one.
	 * 
	 * @param {string} id - The name of the tag.
	 * @param {Function} render - The function that formats the tag.
	 * @param {Object} [options] - Extra settings for the tag.
	 */
	register = (id, render, options) => {
		this.mapperFile.register(id, render, options);
	};

	/**
	 * Copies rules from other mappers.
	 * 
	 * @param {...Mapper} mappers - The mappers to copy from.
	 */
	inherit = (...mappers) => {
		this.mapperFile.inherit(...mappers);
	};

	/**
	 * Gets a rule by its name.
	 * 
	 * @param {string} id - The tag name.
	 * @returns {Object|null}
	 */
	get = id => {
		return this.mapperFile.get(id);
	};

	removeOutput = id => {
		this.mapperFile.removeOutput(id);
	};

	clear = () => {
		this.mapperFile.clear();
	};

	_initializeMappers() {
		if (!this.targetFormat) {
			runtimeError(["{line}<$red:Undefined Format$>: <$yellow:Format argument is not defined.$>{line}"]);
		}

		if (!this.mapperFile && this.targetFormat) {
			runtimeError([`{line}<$red:Unknown Format$>: <$yellow:Mapper for format '${this.targetFormat}' not found.$>{line}`]);
		}
	}

	reportWarning(message) {
		this.warnings.push(message);
	}


	_ensurePrepared() {
		if (this._prepared) return;

		// Final check
		if (!this.mapperFile) {
			runtimeError([
				`{line}<$red:Unknown Format$>: <$yellow:No mapper found for format:$> <$green:'${this.targetFormat}'$>`,
				`{N}<$yellow:Make sure you have registered format mapper correctly.$>{line}`
			]);
		}

		this._prepared = true;
	}

	/**
	 * Breaks the code into small pieces called tokens.
	 * 
	 * @param {string} [src=this.src] - The code to break apart.
	 * @returns {Promise<Array<Object>>} - The list of tokens.
	 */
	async lex(src = this.src) {
		this._ensurePrepared();
		if (src !== this.src) this.src = src;
		let tokens = lexer(this.src, this.filename);
		return tokens;
	}

	/**
	 * Organizes the code into a tree structure.
	 * Also handles modules and checks for errors.
	 * 
	 * @param {string} [src=this.src] - Optional source override.
	 * @returns {Promise<Array<Object>>} - The final code tree.
	 */
	async parse(src = this.src) {
		const tokens = await this.lex(src);
		let ast = parser(tokens, this.filename, this.placeholders);

		ast = await resolveModules(ast, {
			mapperFile: this.mapperFile,
			filename: this.filename,
			format: this.targetFormat,
			instance: this,
			importStack: this.importStack
		});

		if (this.mapperFile) {
			validateAST(ast, this.mapperFile, this);
		}

		return ast;
	}

	parseSync(src = this.src) {
		this._ensurePrepared();
		if (src !== this.src) this.src = src;
		const tokens = lexer(this.src, this.filename);
		let ast = parser(tokens, this.filename, this.placeholders);

		if (this.mapperFile) {
			validateAST(ast, this.mapperFile, this);
		}

		return ast;
	}

	/**
	 * Turns the SomMark code into the final format.
	 * 
	 * @param {string} [src=this.src] - Optional source override.
	 * @returns {Promise<string>} - The finished code.
	 */
	async transpile(src = this.src) {
		if (src !== this.src) this.src = src;
		this._ensurePrepared();

		const ast = await this.parse(src);
		let result = await transpiler({ ast, format: this.targetFormat, mapperFile: this.mapperFile });

		return result;
	}


	async format(options = {}) {
		const tokens = await this.lex();
		const ast = parser(tokens, this.filename);
		return formatAST(ast, options);
	}

	formatSync(options = {}) {
		const tokens = lexer(this.src, this.filename);
		const ast = parser(tokens, this.filename);
		return formatAST(ast, options);
	}
}

/**
 * A quick way to break code into tokens.
 * Uses HTML settings by default.
 * 
 * @param {string} src - The raw SomMark source.
 * @param {string} [filename="anonymous"] - Filename for error context.
 * @returns {Promise<Array<Object>>} - The list of tokens.
 */
const lex = async (src, filename = "anonymous") => {
	return await new SomMark({ src, filename, format: htmlFormat }).lex();
};

/**
 * A quick way to organize code into a tree.
 * Uses HTML settings by default.
 * 
 * @param {string} src - The raw SomMark source.
 * @param {string} [filename="anonymous"] - Filename for error context.
 * @returns {Promise<Array<Object>>} - The final code tree.
 */
async function parse(src, filename = "anonymous") {
	if (!src) {
		runtimeError([`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for parsing.$>{line}`]);
	}
	return await new SomMark({ src, filename, format: htmlFormat }).parse();
}

/**
 * The easiest way to process SomMark code.
 * 
 * @param {Object} options - Transpilation options.
 * @param {string} options.src - Raw source code.
 * @param {string} [options.format="html"] - Target format.
 * @param {string} [options.filename="anonymous"] - Filename for context.
 * @param {Mapper|null} [options.mapperFile=null] - Custom rules for formatting.
 * @param {boolean} [options.removeComments=true] - Strip comments.
 * @param {Object} [options.placeholders={}] - Global placeholders.
 * @param {Object} [options.placeholder={}] - Alias for placeholders.
 * @param {Array<string>} [options.customProps=[]] - Custom attribute whitelist.
 * @returns {Promise<string>} - Transpiled output.
 */
async function transpile(options = {}) {
	const { src, format = htmlFormat, filename = "anonymous", mapperFile = null, removeComments = true, placeholder = {}, placeholders = {}, customProps = [] } = options;
	if (typeof options !== "object" || options === null) {
		runtimeError([`{line}<$red:Invalid Options:$> <$yellow:The options argument must be a non-null object.$>{line}`]);
	}
	const knownProps = ["src", "format", "filename", "mapperFile", "removeComments", "placeholder", "placeholders", "customProps"];
	Object.keys(options).forEach(key => {
		if (!knownProps.includes(key)) {
			runtimeError([
				`{line}<$red:Unknown Property:$> <$yellow:The property $> <$green:'${key}'$> <$yellow:is not recognized.$>{line}`
			]);
		}
	});
	if (!src) {
		runtimeError([`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for transpilation.$>{line}`]);
	}

	const sm = new SomMark({ src, format, filename, mapperFile, removeComments, placeholder, placeholders, customProps });
	return await sm.transpile();
}

/**
 * A quick, synchronous way to get tokens.
 * 
 * @param {string} src - Raw source code.
 * @returns {Array<Object>} - The list of tokens.
 */
const lexSync = src => lexer(src);

/**
 * A quick, synchronous way to get the code tree.
 * 
 * @param {string} src - Raw source code.
 * @param {Object} [options={}] - Parsing options.
 * @returns {Array<Object>} - The code tree.
 */
const parseSync = (src, options = {}) => {
	const { format = htmlFormat, filename = "anonymous", mapperFile = null, removeComments = true, placeholder = {}, placeholders = {}, customProps = [] } = options;
	return new SomMark({ src, format, filename, mapperFile, removeComments, placeholder, placeholders, customProps }).parseSync();
};

import { findAndLoadConfig } from "./core/helpers/config-loader.js";

export {
	HTML,
	MARKDOWN,
	MDX,
	Json,
	XML,
	Mapper,
	FORMATS,
	lex,
	parse,
	transpile,
	lexSync,
	parseSync,
	formatAST,
	TOKEN_TYPES,
	labels,
	enableColor,
	safeArg,
	findAndLoadConfig
};
export default SomMark;
