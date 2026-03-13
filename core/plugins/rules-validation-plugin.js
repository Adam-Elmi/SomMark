import { transpilerError } from "../errors.js";

/**
 * Rules Validation Plugin
 * Validates rules defined in mapper files.
 * Supports rules for arguments (key, value) and content.
 */
const RulesValidationPlugin = {
	name: "rules-validation",
	type: "on-ast",
	onAst(ast, { mapperFile }) {
		if (!mapperFile) return ast;

		const validateNode = (node, parentTarget = null) => {
			if (!node) return;

			// ========================================================================== //
			//  1. TEXT nodes validation                                                  //
			// ========================================================================== //
			if (node.type === "Text" && parentTarget) {
				this.runValidations(parentTarget, null, node.text, "Text");
			}

			// ========================================================================== //
			//  2. Identifier nodes validation (Block, Inline, AtBlock)                   //
			// ========================================================================== //
			if (node.id) {
				const target = mapperFile.get(node.id);
				if (target) {
					this.runValidations(target, node.args, this.getContent(node), node.type);
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

	runValidations(target, args, content, type) {
		if (!target.options || !target.options.rules) return;
		const { rules } = target.options;
		const id = Array.isArray(target.id) ? target.id.join(" | ") : target.id;

		// ========================================================================== //
		//  1. Validate Args Count & Keys                                             //
		// ========================================================================== //
		if (args && rules.args) {
			const { min, max, required, includes } = rules.args;
			const argKeys = Object.keys(args).filter(key => isNaN(parseInt(key)));
			const argCount = args.length;

			if (min !== undefined && argCount < min) {
				transpilerError([
					"{line}<$red:Validation Error:$> ",
					`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:requires at least$> <$green:${min}$> <$yellow:argument(s). Found$> <$red:${argCount}$>{line}`
				]);
			}
			if (max !== undefined && argCount > max) {
				transpilerError([
					"{line}<$red:Validation Error:$> ",
					`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:accepts at most$> <$green:${max}$> <$yellow:argument(s). Found$> <$red:${argCount}$>{line}`
				]);
			}
			if (required && Array.isArray(required)) {
				const missingKeys = required.filter(key => !Object.prototype.hasOwnProperty.call(args, key));
				if (missingKeys.length > 0) {
					transpilerError([
						"{line}<$red:Validation Error:$> ",
						`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:is missing required argument(s):$> <$red:${missingKeys.join(", ")}$>{line}`
					]);
				}
			}
			if (includes && Array.isArray(includes)) {
				const invalidKeys = argKeys.filter(key => !includes.includes(key));
				if (invalidKeys.length > 0) {
					transpilerError([
						"{line}<$red:Validation Error:$> ",
						`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:contains invalid argument key(s):$> <$red:${invalidKeys.join(", ")}$>`,
						`{N}<$yellow:Allowed keys are:$> <$green:${includes.join(", ")}$>{line}`
					]);
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
						transpilerError([
							"{line}<$red:Validation Error:$> ",
							`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:contains argument keys that do not match pattern $> <$green:${keyPattern.toString()}$>: <$red:${invalidKeys.join(", ")}$>{line}`
						]);
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
								transpilerError([
									"{line}<$red:Validation Error:$> ",
									`<$yellow:Argument key$> <$blue:'${key}'$> <$yellow:in$> <$blue:'${id}'$> <$yellow:has invalid value:$> <$red:'${value}'$>{N}<$yellow:Expected to match pattern:$> <$green:${valueRule.toString()}$>{line}`
								]);
							} else if (typeof valueRule === "function" && !valueRule(value)) {
								transpilerError([
									"{line}<$red:Validation Error:$> ",
									`<$yellow:Argument key$> <$blue:'${key}'$> <$yellow:in$> <$blue:'${id}'$> <$yellow:failed custom validation for value:$> <$red:'${value}'$>{line}`
								]);
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
				transpilerError([
					"{line}<$red:Validation Error:$> ",
					`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:content exceeds maximum length of$> <$green:${maxLength}$> <$yellow:characters. Found$> <$red:${content.length}$>{line}`
				]);
			}
			if (match && match instanceof RegExp && !match.test(content)) {
				transpilerError([
					"{line}<$red:Validation Error:$> ",
					`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:content does not match required pattern:$> <$green:${match.toString()}$>{line}`
				]);
			}
		}

		// ========================================================================== //
		//  4. self-closing                                                           //
		// ========================================================================== //
		if (rules.is_self_closing && (type === "Block" || content)) {
			if (content) {
				transpilerError([
					"{line}<$red:Validation Error:$> ",
					`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:is self-closing tag and is not allowed to have a content | children$>{line}`
				]);
			}
		}

		// ========================================================================== //
		//  5. Type Validation (Block, Inline, AtBlock)                               //
		// ========================================================================== //
		if (rules.type && type !== "Text") {
			const allowedTypes = Array.isArray(rules.type) ? rules.type : [rules.type];
			if (!allowedTypes.includes("any") && !allowedTypes.includes(type)) {
				transpilerError([
					"{line}<$red:Validation Error:$> ",
					`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:is expected to be type$> <$green:'${allowedTypes.join(" | ")}'$>{N}<$cyan:Received type: $> <$magenta:'${type}'$>{line}`
				]);
			}
		}
	}
};

export default RulesValidationPlugin;
