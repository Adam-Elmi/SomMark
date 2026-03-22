import { transpilerError } from "../errors.js";

/**
 * Rules Validation Plugin
 * Validates rules defined in mapper files.
 * Supports rules for arguments (key, value) and content.
 */
const RulesValidationPlugin = {
	name: "rules-validation",
	type: "on-ast",
	author: "Adam-Elmi",
	description: "Checks your document to make sure all tags and arguments follow the rules set in the mapper.",
	onAst(ast, { mapperFile, instance }) {
		if (!mapperFile) return ast;

		const validateNode = (node, parentTarget = null) => {
			if (!node) return;

			// ========================================================================== //
			//  1. TEXT nodes validation                                                  //
			// ========================================================================== //
			if (node.type === "Text" && parentTarget) {
				this.runValidations(node, parentTarget, null, node.text, "Text", mapperFile, instance);
			}

			// ========================================================================== //
			//  2. Identifier nodes validation (Block, Inline, AtBlock)                   //
			// ========================================================================== //
			if (node.id) {
				const target = mapperFile.get(node.id);
				if (target) {
					this.runValidations(node, target, node.args, this.getContent(node), node.type, mapperFile, instance);
				}
			}

			// ========================================================================== //
			//  Recursive traversal                                                       //
			// ========================================================================== //
			if (node.body && Array.isArray(node.body)) {
				const currentTarget = node.id ? mapperFile.get(node.id) : parentTarget;
				node.body.forEach(child => validateNode(child, currentTarget));
			}
		};

		const root = Array.isArray(ast) ? ast : [ast];
		root.forEach(node => validateNode(node));

		return ast;
	},

	getContent(node) {
		if (node.type === "Inline") return node.value;
		if (node.type === "AtBlock") return node.content;
		return "";
	},

	runValidations(node, target, args, content, type, mapperFile, instance) {
		if (!target.options) return;
		const rules = target.options.rules || {};
		const id = Array.isArray(target.id) ? target.id.join(" | ") : target.id;
		const context = instance ? { src: instance.src, range: node.range, filename: instance.filename } : null;

		// ========================================================================== //
		//  1. Validate Args Count & Keys                                             //
		// ========================================================================== //
		if (args && rules.args) {
			const { min, max, required, includes } = rules.args;
			const argKeys = Object.keys(args).filter(key => isNaN(parseInt(key)));
			const argCount = args.length;

			if (min !== undefined && argCount < min) {
				transpilerError(
					[
						"<$red:Validation Error:$> ",
						`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:requires at least$> <$green:${min}$> <$yellow:argument(s). Found$> <$red:${argCount}$>`
					],
					context
				);
			}
			if (max !== undefined && argCount > max) {
				transpilerError(
					[
						"<$red:Validation Error:$> ",
						`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:accepts at most$> <$green:${max}$> <$yellow:argument(s). Found$> <$red:${argCount}$>`
					],
					context
				);
			}
			if (required && Array.isArray(required)) {
				const missingKeys = required.filter(key => !Object.prototype.hasOwnProperty.call(args, key));
				if (missingKeys.length > 0) {
					transpilerError(
						[
							"<$red:Validation Error:$> ",
							`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:is missing required argument(s):$> <$red:${missingKeys.join(", ")}$>`
						],
						context
					);
				}
			}
			if (includes && Array.isArray(includes)) {
				const invalidKeys = argKeys.filter(key => {
					return !includes.includes(key) && !mapperFile.extraProps.has(key);
				});
				if (invalidKeys.length > 0) {
					transpilerError(
						[
							"<$red:Validation Error:$> ",
							`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:contains invalid argument key(s):$> <$red:${invalidKeys.join(", ")}$>`,
							`{N}<$yellow:Allowed keys are:$> <$green:${includes.join(", ")}$>`
						],
						context
					);
				}
			}
		}

		// ========================================================================== //
		//  2. Validation on Keys and Values                                          //
		// ========================================================================== //
		if (args) {
			const argKeys = Object.keys(args).filter(key => isNaN(parseInt(key)));

			// Validate keys pattern
			if (rules.keys) {
				const keyPattern = rules.keys instanceof RegExp ? rules.keys : null;
				if (keyPattern) {
					const invalidKeys = argKeys.filter(key => !keyPattern.test(key));
					if (invalidKeys.length > 0) {
						transpilerError(
							[
								"<$red:Validation Error:$> ",
								`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:contains argument keys that do not match pattern $> <$green:${keyPattern.toString()}$>: <$red:${invalidKeys.join(", ")}$>`
							],
							context
						);
					}
				}
			}

			// ========================================================================== //
			//  Validate specific values                                                  //
			// ========================================================================== //
			if (rules.values) {
				for (const [key, value] of Object.entries(args)) {
					if (isNaN(parseInt(key))) {
						const valueRule = rules.values[key];
						if (valueRule) {
							if (valueRule instanceof RegExp && !valueRule.test(value)) {
								transpilerError(
									[
										"<$red:Validation Error:$> ",
										`<$yellow:Argument key$> <$blue:'${key}'$> <$yellow:in$> <$blue:'${id}'$> <$yellow:has invalid value:$> <$red:'${value}'$>{N}<$yellow:Expected to match pattern:$> <$green:${valueRule.toString()}$>`
									],
									context
								);
							} else if (typeof valueRule === "function" && !valueRule(value)) {
								transpilerError(
									[
										"<$red:Validation Error:$> ",
										`<$yellow:Argument key$> <$blue:'${key}'$> <$yellow:in$> <$blue:'${id}'$> <$yellow:failed custom validation for value:$> <$red:'${value}'$>`
									],
									context
								);
							}
						}
					}
				}
			}
		}

		// ========================================================================== //
		//  3. Content Validation                                                     //
		// ========================================================================== //
		if (content !== undefined && rules.content) {
			const { maxLength, match } = rules.content;
			if (maxLength && content.length > maxLength) {
				transpilerError(
					[
						"<$red:Validation Error:$> ",
						`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:content exceeds maximum length of$> <$green:${maxLength}$> <$yellow:characters. Found$> <$red:${content.length}$>`
					],
					context
				);
			}
			if (match && match instanceof RegExp && !match.test(content)) {
				transpilerError(
					[
						"<$red:Validation Error:$> ",
						`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:content does not match required pattern:$> <$green:${match.toString()}$>`
					],
					context
				);
			}
		}

		// ========================================================================== //
		//  4. self-closing                                                           //
		// ========================================================================== //
		if (rules.is_self_closing && (type === "Block" || content)) {
			if (content) {
				transpilerError(
					[
						"<$red:Validation Error:$> ",
						`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:is self-closing tag and is not allowed to have a content | children$>`
					],
					context
				);
			}
		}

		// ========================================================================== //
		//  5. Type Validation (Block, Inline, AtBlock)                               //
		// ========================================================================== //
		const typeToValidate = target.options.type;
		if (typeToValidate && type !== "Text") {
			const allowedTypes = Array.isArray(typeToValidate) ? typeToValidate : [typeToValidate];
			if (!allowedTypes.includes("any") && !allowedTypes.includes(type)) {
				transpilerError(
					[
						"<$red:Validation Error:$> ",
						`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:is expected to be type$> <$green:'${allowedTypes.join(" | ")}'$>{N}<$cyan:Received type: $> <$magenta:'${type}'$>`
					],
					context
				);
			}
		}
	}
};

export default RulesValidationPlugin;
