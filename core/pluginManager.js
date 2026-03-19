/**
 * Plugin Manager
 * Handles sorting by priority and running hooks at various stages.
 */
export default class PluginManager {
	constructor(plugins = [], priority = []) {
		// ========================================================================== //
		//  Plugin Sorting by Priority                                               //
		// ========================================================================== //
		this.plugins = [...plugins].sort((a, b) => {
			const getIndex = (p) => {
				const index = priority.findIndex(item => {
					if (typeof item === "string") {
						return item === p.name;
					}
					return item === p;
				});
				return index;
			};

			const indexA = getIndex(a);
			const indexB = getIndex(b);

			if (indexA !== -1 && indexB !== -1) return indexA - indexB;
			if (indexA !== -1) return -1;
			if (indexB !== -1) return 1;

			// Default rule: built-ins first, then external/user-defined
			const isBuiltInA = ["module-system", "raw-content", "comment-remover", "rules-validation", "sommark-format"].includes(a.name);
			const isBuiltInB = ["module-system", "raw-content", "comment-remover", "rules-validation", "sommark-format"].includes(b.name);

			if (isBuiltInA && !isBuiltInB) return -1;
			if (!isBuiltInA && isBuiltInB) return 1;

			return 0;
		});
	}

	// ========================================================================== //
	//  Preprocessing Hooks (Before Lexing)                                      //
	// ========================================================================== //
	async runPreprocessor(src, scope, context) {
		let processedSrc = src;
		const preprocessors = this.plugins.filter(p => {
			const types = Array.isArray(p.type) ? p.type : [p.type];
			return types.includes("preprocessor") && (p.scope === scope || !p.scope);
		});

		for (const plugin of preprocessors) {
			if (typeof plugin.beforeLex === "function") {
				plugin.context = context;
				processedSrc = await plugin.beforeLex.call(plugin, processedSrc);
			}
		}
		return processedSrc;
	}

	// ========================================================================== //
	//  Post-Lexing Hooks (Token Transformation)                                  //
	// ========================================================================== //
	async runAfterLex(tokens) {
		let processedTokens = tokens;
		const afterLexers = this.plugins.filter(p => {
			const types = Array.isArray(p.type) ? p.type : [p.type];
			return (types.includes("lexer") || types.includes("after-lexer")) && typeof p.afterLex === "function";
		});

		for (const plugin of afterLexers) {
			processedTokens = await plugin.afterLex.call(plugin, processedTokens);
		}
		return processedTokens;
	}

	// ========================================================================== //
	//  AST Transformation Hooks (After Parsing)                                 //
	// ========================================================================== //
	async runOnAst(ast, context = {}) {
		let processedAst = ast;
		const astPlugins = this.plugins.filter(p => {
			const types = Array.isArray(p.type) ? p.type : [p.type];
			return (types.includes("parser") || types.includes("on-ast")) && typeof p.onAst === "function";
		});

		for (const plugin of astPlugins) {
			processedAst = await plugin.onAst.call(plugin, processedAst, context);
		}
		return processedAst;
	}

	// ========================================================================== //
	//  Mapper Extensions (Tag Definitions and Rules)                            //
	// ========================================================================== //
	getMapperExtensions() {
		const extensions = { outputs: [], rules: {} };
		const mapperPlugins = this.plugins.filter(p => {
			const types = Array.isArray(p.type) ? p.type : [p.type];
			return types.includes("mapper");
		});

		for (const plugin of mapperPlugins) {
			if (plugin.outputs) {
				extensions.outputs.push(...plugin.outputs);
			}
			if (plugin.rules) {
				extensions.rules = { ...extensions.rules, ...plugin.rules };
			}
		}
		return extensions;
	}

	// ========================================================================== //
	//  Registration Hooks                                                       //
	// ========================================================================== //
	runRegisterHooks(sm) {
		for (const plugin of this.plugins) {
			const registerFn = plugin.registerOutput || plugin.register;
			if (typeof registerFn === "function") {
				registerFn.call(plugin, sm);
			}
		}
	}

	// ========================================================================== //
	//  Post-Processing Hooks (Final Output Transformation)                      //
	// ========================================================================== //
	async runTransformers(output) {
		let processedOutput = output;
		const transformers = this.plugins.filter(p => {
			const types = Array.isArray(p.type) ? p.type : [p.type];
			return types.includes("transform") || types.includes("postprocessor");
		});

		for (const plugin of transformers) {
			const transformFn = plugin.transform || plugin.afterTranspile;
			if (typeof transformFn === "function") {
				processedOutput = await transformFn.call(plugin, processedOutput);
			}
		}
		return processedOutput;
	}

	// ========================================================================== //
	//  Format-Specific Mapper Retrieval                                         //
	// ========================================================================== //
	getFormatMapper(formatName) {
		const plugin = this.plugins.find(p => p.format === formatName && p.mapper);
		return plugin ? plugin.mapper : null;
	}
}
