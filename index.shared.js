import { VirtualFS } from "./helpers/virtual-fs.js";
import { FetchFS } from "./helpers/fetch-fs.js";
import lexer from "./core/lexer.js";
import parser from "./core/parser.js";
import transpiler from "./core/transpiler.js";
import Mapper from "./mappers/mapper.js";
import { registerSharedOutputs } from "./mappers/shared/index.js";
import HTML from "./mappers/languages/html.js";
import MARKDOWN from "./mappers/languages/markdown.js";
import MDX from "./mappers/languages/mdx.js";
import Json from "./mappers/languages/json.js";
import Jsonc from "./mappers/languages/jsonc.js";
import XML from "./mappers/languages/xml.js";
import CSV from "./mappers/languages/csv.js";
import TOML from "./mappers/languages/toml.js";
import YAML from "./mappers/languages/yaml.js";
import TEXT from "./mappers/languages/text.js";
import { runtimeError } from "./core/errors.js";
import FORMATS, { textFormat, htmlFormat, markdownFormat, mdxFormat, jsonFormat, jsoncFormat, xmlFormat, csvFormat, tomlFormat, yamlFormat } from "./core/formats.js";
import TOKEN_TYPES from "./core/tokenTypes.js";
import * as labels from "./core/labels.js";
import { resolveModules } from "./core/modules.js";
import { validateAST } from "./core/validator.js";
import { enableColor } from "./helpers/colorize.js";
import { safeArg } from "./helpers/utils.js";
import { startSpinner, stopSpinner } from "./helpers/spinner.js";
import { preprocessRuntimeLogic } from "./core/helpers/preprocessor.js";

let defaultFs = null;
let defaultCwd = "/";
let defaultFindAndLoadConfig = async () => ({});
let defaultResolvePath = (p) => p; // identity in browser; overridden to path.resolve in Node.js

const isURL = (s) => typeof s === "string" && /^https?:\/\//.test(s);

export function setDefaultCwd(cwd) {
	defaultCwd = cwd;
}

export function setDefaultFs(fs) {
	defaultFs = fs;
	Evaluator.setDefaultFs(fs);
}

export function setDefaultResolvePath(fn) {
	defaultResolvePath = fn;
}

const resolveFilename = (f) => (f && f !== "anonymous") ? defaultResolvePath(f) : f;

export function setDefaultFindAndLoadConfig(fn) {
	defaultFindAndLoadConfig = fn;
}

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
	 * @param {Object} [options.placeholders={}] - Values to use for p{placeholders}.
	 * @param {Array<string>} [options.customProps=[]] - Allowed custom HTML attributes.
	 * @param {Object} [options.importAliases={}] - Custom path aliases for modules.
	 * @param {Array<string>} [options.importStack=[]] - Tracking for circular dependencies.
	 * @param {string} [options.baseDir=null] - The base directory for resolving relative paths.
	 */
	constructor(options = {}) {
		const { src, ast = null, format, mapperFile = null, filename = "anonymous", removeComments = true, placeholders = {}, customProps = [], fallbackTarget = true, outputValidator = null, importAliases = {}, importStack = [], baseDir = null, moduleCache = null, showSpinner = true, security = {}, dualOutput = false, moduleIdentityToken = null } = options;
		this.rawSettings = options;
		this.src = src;
		this.ast = ast;
		this.targetFormat = format;
		this.mapperFile = mapperFile;
		this.filename = resolveFilename(filename);
		this.removeComments = removeComments;
		this.placeholders = placeholders;
		this.customProps = customProps;
		this.dualOutput = dualOutput;
		this.cwd = options.baseDir || (options.files ? "/" : defaultCwd);
		this.fs = options.fs
			|| (options.files ? new VirtualFS(options.files) : null)
			|| (isURL(options.baseDir) ? new FetchFS(options.baseDir) : defaultFs);

		// Validate fallbackTarget — "style" is accepted as an alias for true (backward compat)
		const VALID_FALLBACK_TARGETS = new Set([true, false, "style"]);
		if (!VALID_FALLBACK_TARGETS.has(fallbackTarget)) {
			runtimeError([
				`{line}<$red:Invalid fallbackTarget$>: <$green:'${fallbackTarget}'$> <$yellow:is not a valid value.$>`,
				`{N}<$yellow:Use$> <$green:true$> <$yellow:or$> <$green:false$><$yellow:.$>{line}`
			]);
		}
		this.fallbackTarget = fallbackTarget === "style" ? true : fallbackTarget;
		this.outputValidator = outputValidator;
		this.importAliases = importAliases;
		this.importStack = importStack;
		this.baseDir = baseDir;
		this.moduleCache = moduleCache || new Map();
		this.showSpinner = showSpinner;
		this.security = {
			allowRaw: security?.allowRaw !== false,
			maxDepth: security?.maxDepth ?? 5,
			timeout: security?.timeout ?? 5000,
			sanitize: typeof security?.sanitize === "function" ? security.sanitize : null,
			allowFetch: security?.allowFetch !== false,
			allowHttp: security?.allowHttp === true,
			allowedOrigins: Array.isArray(security?.allowedOrigins) ? security.allowedOrigins.map(o => o.toLowerCase()) : null,
			allowedExtensions: Array.isArray(security?.allowedExtensions) ? security.allowedExtensions.map(e => e.toLowerCase()) : null
		};
		this.warnings = [];
		this._prepared = false;

		// Create a random token to safely wrap data
		this.moduleIdentityToken = moduleIdentityToken || `$_SM_MOD_${Math.random().toString(36).slice(2, 7)}_$`;

		this.Mapper = Mapper;

		const mapperFiles = { [htmlFormat]: HTML, [markdownFormat]: MARKDOWN, [mdxFormat]: MDX, [jsonFormat]: Json, [jsoncFormat]: Jsonc, [xmlFormat]: XML, [csvFormat]: CSV, [tomlFormat]: TOML, [yamlFormat]: YAML, [textFormat]: TEXT };

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

			this.mapperFile.options.usePrivateAttributes = this.usePrivateAttributes;
			this.mapperFile.options.fallbackTarget = this.fallbackTarget;

			// Initialize custom props whitelist
			if (this.customProps && this.customProps.length > 0) {
				const props = Array.isArray(this.customProps) ? this.customProps : [this.customProps];
				props.forEach(prop => this.mapperFile.customProps.add(prop));
			}
		}

		this._initializeMappers();
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

	lexSync(src = this.src) {
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
		let ast = parser(tokens, this.filename, this.placeholders, {});

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
		let ast = parser(tokens, this.filename, this.placeholders, {});

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

		if (this.showSpinner) startSpinner();
		try {
			const ast = this.ast || await this.parse(src);
			let result = await transpiler({
				ast,
				format: this.targetFormat,
				mapperFile: this.mapperFile,
				security: this.security,
				settings: this.rawSettings,
				dualOutput: this.dualOutput,
				instance: this
			});

			if (this.outputValidator && typeof this.outputValidator === "function") {
				await this.outputValidator(result);
			}

			return result;
		} finally {
			if (this.showSpinner) stopSpinner();
		}
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
	if (src === undefined || src === null) {
		runtimeError([`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for tokenization.$>{line}`]);
	}
	if (typeof src !== "string") {
		runtimeError([`{line}<$red:Invalid Source Type:$> <$yellow:The 'src' argument must be a string, received ${typeof src}.$>{line}`]);
	}
	return lexer(src, resolveFilename(filename));
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
	if (src === undefined || src === null) {
		runtimeError([`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for parsing.$>{line}`]);
	}
	if (typeof src !== "string") {
		runtimeError([`{line}<$red:Invalid Source Type:$> <$yellow:The 'src' argument must be a string, received ${typeof src}.$>{line}`]);
	}
	return await new SomMark({ src, filename, format: textFormat }).parse();
}

/**
 * Transpiles SomMark code to a target format.
 * 
 * @param {Object} options - Transpilation options.
 * @param {string} options.src - Raw source code.
 * @param {string} [options.format="html"] - Target format.
 * @param {string} [options.filename="anonymous"] - Filename for context.
 * @param {Mapper|null} [options.mapperFile=null] - Custom rules for formatting.
 * @param {boolean} [options.removeComments=true] - Strip comments.
 * @param {Object} [options.placeholders={}] - Global placeholders.
 * @param {Array<string>} [options.customProps=[]] - Custom attribute whitelist.
 * @param {Object} [options.importAliases={}] - Custom path aliases for modules.
 * @returns {Promise<string>} - Transpiled output.
 */
async function transpile(options = {}) {
	if (typeof options !== "object" || options === null) {
		runtimeError([`{line}<$red:Invalid Options:$> <$yellow:The options argument must be a non-null object.$>{line}`]);
	}
	const { src, ast, format } = options;

	if (format === undefined || format === null) {
		runtimeError([`{line}<$red:Missing Target Format:$> <$yellow:The 'format' parameter is required for transpilation (e.g. 'html', 'markdown', 'xml', 'mdx', 'json', etc.).$>{line}`]);
	}

	if ((src === undefined || src === null) && (ast === undefined || ast === null)) {
		runtimeError([`{line}<$red:Missing Input:$> <$yellow:Either 'src' or 'ast' must be provided for transpilation.$>{line}`]);
	}

	const sm = new SomMark(options);
	return await sm.transpile();
}

/**
 * A quick, synchronous way to get tokens.
 * 
 * @param {string} src - Raw source code.
 * @param {string} [filename="anonymous"] - Filename for error context.
 * @returns {Array<Object>} - The list of tokens.
 */
const lexSync = (src, filename = "anonymous") => {
	if (src === undefined || src === null) {
		runtimeError([`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for tokenization.$>{line}`]);
	}
	if (typeof src !== "string") {
		runtimeError([`{line}<$red:Invalid Source Type:$> <$yellow:The 'src' argument must be a string, received ${typeof src}.$>{line}`]);
	}
	return lexer(src, resolveFilename(filename));
};

/**
 * A quick, synchronous way to get the code tree.
 * 
 * @param {string} src - Raw source code.
 * @param {Object} [options={}] - Parsing options.
 * @returns {Array<Object>} - The code tree.
 */
const parseSync = (src, filename = "anonymous") => {
	if (src === undefined || src === null) {
		runtimeError([`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for parsing.$>{line}`]);
	}
	if (typeof src !== "string") {
		runtimeError([`{line}<$red:Invalid Source Type:$> <$yellow:The 'src' argument must be a string, received ${typeof src}.$>{line}`]);
	}
	const resolved = resolveFilename(filename);
	const tokens = lexer(src, resolved);
	return parser(tokens, resolved);
};

async function findAndLoadConfig(targetPath) {
	return await defaultFindAndLoadConfig(targetPath);
}

import Evaluator, { setCompilerClass } from "./core/evaluator.js";
setCompilerClass(SomMark);

export {
	registerSharedOutputs,
	HTML,
	MARKDOWN,
	MDX,
	Json,
	Jsonc,
	XML,
	CSV,
	TOML,
	YAML,
	Mapper,
	FORMATS,
	lex,
	parse,
	transpile,
	lexSync,
	parseSync,
	TOKEN_TYPES,
	labels,
	enableColor,
	safeArg,
	findAndLoadConfig,
	Evaluator,
	preprocessRuntimeLogic
};
export default SomMark;
