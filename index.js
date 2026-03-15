import lexer from "./core/lexer.js";
import parser from "./core/parser.js";
import transpiler from "./core/transpiler.js";
import Mapper from "./mappers/mapper.js";
import HTML from "./mappers/languages/html.js";
import MARKDOWN from "./mappers/languages/markdown.js";
import MDX from "./mappers/languages/mdx.js";
import Json from "./mappers/languages/json.js";
import TagBuilder from "./formatter/tag.js";
import MarkdownBuilder from "./formatter/mark.js";
import { runtimeError } from "./core/errors.js";
import FORMATS, { textFormat, htmlFormat, markdownFormat, mdxFormat, jsonFormat } from "./core/formats.js";
import TOKEN_TYPES from "./core/tokenTypes.js";
import * as labels from "./core/labels.js";
import PluginManager from "./core/pluginManager.js";
import QuoteEscaper from "./core/plugins/quote-escaper.js";
import ModuleSystem from "./core/plugins/module-system.js";
import RawContentPlugin from "./core/plugins/raw-content-plugin.js";
import CommentRemover from "./core/plugins/comment-remover.js";
import RulesValidationPlugin from "./core/plugins/rules-validation-plugin.js";
import SomMarkFormat from "./core/plugins/sommark-format.js";
import { enableColor } from "./helpers/colorize.js";
import { htmlTable, list, parseList, safeArg, todo } from "./helpers/utils.js";


export const BUILT_IN_PLUGINS = [QuoteEscaper, ModuleSystem, RawContentPlugin, CommentRemover, RulesValidationPlugin, SomMarkFormat];

class SomMark {
	constructor({ src, format, mapperFile = null, includeDocument = true, plugins = [], excludePlugins = [], priority = [] }) {
		this.src = src;
		this.format = format;
		this.mapperFile = mapperFile;
		this.priority = priority;

		// 1. Identify which built-in plugins should be active by default
		// For now, QuoteEscaper is active, others are inactive (require manual activation)
		const inactiveByDefault = ["raw-content", "sommark-format"];
		let activeBuiltIns = BUILT_IN_PLUGINS.filter(p =>
			!inactiveByDefault.includes(p.name) && !excludePlugins.includes(p.name)
		);

		// 2. Process 'plugins' array: 
		// - If string, look up in BUILT_IN_PLUGINS
		// - If object with { name, options }, it's a built-in override
		// - If object with { plugin, options }, it's an external override
		// - If object without name/plugin but with other keys, it's a direct plugin object
		let processedPlugins = [];
		let manuallyActivatedNames = [];

		plugins.forEach(p => {
			if (typeof p === "string") {
				const builtIn = BUILT_IN_PLUGINS.find(bp => bp.name === p);
				if (builtIn) {
					processedPlugins.push({ ...builtIn }); // Clone to avoid mutation
					manuallyActivatedNames.push(p);
				}
			} else if (typeof p === "object" && p !== null) {
				if (p.name && p.options && !p.type) {
					// Built-in Override: { name: "raw-content", options: { ... } }
					const builtIn = BUILT_IN_PLUGINS.find(bp => bp.name === p.name);
					if (builtIn) {
						processedPlugins.push({
							...builtIn,
							options: { ...builtIn.options, ...p.options }
						});
						manuallyActivatedNames.push(p.name);
					}
				} else if (p.plugin && p.options) {
					// External Override: { plugin: myPlugin, options: { ... } }
					processedPlugins.push({
						...p.plugin,
						options: { ...p.plugin.options, ...p.options }
					});
				} else {
					// Direct Plugin Object
					processedPlugins.push(p);
				}
			}
		});

		// 3. Merge: Default active built-ins (minus ones manually re-added) + Processed Plugins
		const finalPlugins = [
			...activeBuiltIns
				.filter(p => !manuallyActivatedNames.includes(p.name))
				.map(p => ({ ...p })), // Clone defaults for isolation
			...processedPlugins
		];

		this.plugins = finalPlugins;
		this.pluginManager = new PluginManager(this.plugins, this.priority);

		this.Mapper = Mapper;
		this.includeDocument = includeDocument;

		const mapperFiles = { [htmlFormat]: HTML, [markdownFormat]: MARKDOWN, [mdxFormat]: MDX, [jsonFormat]: Json, [textFormat]: new Mapper() };

		if (!this.mapperFile && this.format) {
			const DefaultMapper = mapperFiles[this.format];
			if (DefaultMapper) {
				this.mapperFile = DefaultMapper.clone();
			}
		} else if (this.mapperFile) {
			this.mapperFile = this.mapperFile.clone();
		}

		this._initializeMappers();
	}

	register = (id, render, options) => {
		this.mapperFile.register(id, render, options);
	};

	inherit = (...mappers) => {
		this.mapperFile.inherit(...mappers);
	};

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
		// 1. Check if a plugin provides a mapper for this format
		const pluginMapper = this.pluginManager.getFormatMapper(this.format);
		if (pluginMapper) {
			this.mapperFile = pluginMapper.clone();
		}

		if (!this.format) {
			runtimeError(["{line}<$red:Undefined Format$>: <$yellow:Format argument is not defined.$>{line}"]);
		}

		if (!this.mapperFile && this.format) {
			runtimeError([`{line}<$red:Unknown Format$>: <$yellow:Mapper for format '${this.format}' not found.$>{line}`]);
		}
	}

	async _applyScopedPreprocessors(src) {
		let processed = await this.pluginManager.runPreprocessor(src, "top-level");

		// Helper for async regex replacement
		const asyncReplace = async (str, regex, scope) => {
			if (typeof str !== "string") return str;
			const matches = [...str.matchAll(regex)];
			if (matches.length === 0) return str;

			// Process all matches in parallel for efficiency
			const replacements = await Promise.all(
				matches.map(async match => {
					// match[2] is the group for content inside quotes/brackets/whatever depending on the regex
					let contentToProcess;
					if (scope === "arguments") contentToProcess = match[2];
					if (scope === "content") contentToProcess = match[2];

					if (contentToProcess !== undefined) {
						const processedContent = await this.pluginManager.runPreprocessor(contentToProcess, scope);
						// Reconstruct the match with processed content
						if (scope === "arguments") return match[0].replace(match[2], processedContent);
						if (scope === "content") return match[0].replace(match[2], processedContent);
					}
					return match[0];
				})
			);

			// Reconstruct string by replacing matches in order
			let i = 0;
			return str.replace(regex, () => replacements[i++]);
		};

		// 1. Process Arguments Scope [...]
		const argRegex = /\[\s*([a-zA-Z0-9\-_$]+)\s*(?:=\s*((?:[^"\\\]]|\\[\s\S]|"[^"]*")*))?\s*\]/g;
		processed = await asyncReplace(processed, argRegex, "arguments");

		// 2. Process Content Scope
		const contentRegex = /(\]\s*)([\s\S]*?)(\s*\[\s*end\s*\])/g;
		processed = await asyncReplace(processed, contentRegex, "content");

		return processed;
	}

	async lex(src = this.src) {
		if (src !== this.src) this.src = src;
		const processedSrc = await this._applyScopedPreprocessors(this.src);
		let tokens = lexer(processedSrc);
		tokens = await this.pluginManager.runAfterLex(tokens);
		return tokens;
	}

	async parse(src = this.src) {
		const tokens = await this.lex(src);
		let ast = parser(tokens);
		ast = await this.pluginManager.runOnAst(ast, { mapperFile: this.mapperFile });
		return ast;
	}

	async transpile(src = this.src) {
		if (src !== this.src) this.src = src;
		// 1. Resolve Dynamic Formats from Plugins if built-in failed
		if (!this.mapperFile) {
			const PluginMapper = this.pluginManager.getFormatMapper(this.format);
			if (PluginMapper) {
				this.mapperFile = PluginMapper.clone ? PluginMapper.clone() : PluginMapper;
			}
		}

		// Final check
		if (!this.mapperFile) {
			runtimeError([
				`{line}<$red:Unknown Format$>: <$yellow:No mapper found for format:$> <$green:'${this.format}'$>`,
				`{N}<$yellow:Make sure you have registered a plugin that provides this format.$>{line}`
			]);
		}

		// Run active registration hooks from plugins
		this.pluginManager.runRegisterHooks(this);

		const ast = await this.parse(src);

		// 2. Extend Mapper with static plugins definitions
		const extensions = this.pluginManager.getMapperExtensions();
		if (extensions.outputs.length > 0) {
			for (const out of extensions.outputs) {
				// Support both object {id, render, options} and array [id, render, options]
				if (Array.isArray(out)) {
					const [id, render, options = {}] = out;
					this.register(id, render, options);
				} else if (typeof out === "object" && out !== null) {
					const renderFn = out.register || out.render;
					if (typeof renderFn === "function") {
						this.register(out.id, renderFn, out.options || {});
					}
				}
			}
		}

		// Add recognized arguments if provided by plugins
		if (extensions.rules && extensions.rules.recognizedArguments) {
			if (Array.isArray(extensions.rules.recognizedArguments)) {
				extensions.rules.recognizedArguments.forEach(arg => this.mapperFile.extraProps.add(arg));
			}
		}

		let result = await transpiler({ ast, format: this.format, mapperFile: this.mapperFile, includeDocument: this.includeDocument });

		// 3. Run Transformers
		return await this.pluginManager.runTransformers(result);
	}
}

const lex = async (src, plugins = [], excludePlugins = []) => {
	return await new SomMark({ src, plugins, format: htmlFormat, excludePlugins }).lex();
};

async function parse(src, plugins = [], excludePlugins = []) {
	if (!src) {
		runtimeError([`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for parsing.$>{line}`]);
	}
	return await new SomMark({ src, plugins, format: htmlFormat, excludePlugins }).parse();
}

async function transpile(options = {}) {
	const { src, format = htmlFormat, mapperFile = null, includeDocument = true, plugins = [], excludePlugins = [], priority = [] } = options;
	if (typeof options !== "object" || options === null) {
		runtimeError([`{line}<$red:Invalid Options:$> <$yellow:The options argument must be a non-null object.$>{line}`]);
	}
	const knownProps = ["src", "format", "mapperFile", "includeDocument", "plugins", "excludePlugins", "priority"];
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

	const sm = new SomMark({ src, format, mapperFile, includeDocument, plugins, excludePlugins, priority });
	return await sm.transpile();
}

export {
	HTML,
	MARKDOWN,
	MDX,
	Json,
	Mapper,
	TagBuilder,
	MarkdownBuilder,
	FORMATS,
	lex,
	parse,
	transpile,
	TOKEN_TYPES,
	labels,
	enableColor,
	htmlTable,
	list,
	parseList,
	safeArg,
	todo
};
export default SomMark;
