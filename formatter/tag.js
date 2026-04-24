import escapeHTML from "../helpers/escapeHTML.js";
import kebabize from "../helpers/kebabize.js";
import { HTML_PROPS } from "../constants/html_props.js";
import { VOID_ELEMENTS } from "../constants/void_elements.js";

/**
 * TagBuilder - A builder pattern utility for programmatic HTML/XML tag generation.
 * Handles attributes, body content, and self-closing tags with high-fidelity escaping.
 */
class TagBuilder {
	#children;
	#attr;
	#is_self_close;

	/**
	 * Creates a new TagBuilder instance.
	 * @param {string} tagName - The name of the tag (e.g., 'div', 'span').
	 */
	constructor(tagName) {
		this.tagName = tagName;
		this.#children = "";
		this.#attr = [];
		this.#is_self_close = false;
	}

	/**
	 * Adds attributes to the tag.
	 * @param {Object} obj - Key-value pair of attributes.
	 * @param {boolean} [strict=false] - If true, boolean true values render as key="true".
	 * @param {...string} arr - Optional list of boolean attributes (e.g., 'disabled', 'required').
	 * @returns {TagBuilder} - Returns this instance for chaining.
	 */
	attributes(obj, strict = false, ...arr) {
		if (obj && obj instanceof Object) {
			Object.entries(obj).forEach(([key, value]) => {
				if (!isNaN(parseInt(key))) return; // Skip numeric positional arguments
				if (value === true) {
					this.#attr.push(strict ? `${key}="true"` : `${key}`);
				} else if (value !== false) {
					let val = value ?? "";
					if (key === "style" && typeof val === "string") {
						// V4 DYNAMIC CSS: Automatically wrap CSS variables in var()
						val = val.replace(/(^|[^\w\-_$])(--[\w\-_$]+)(?![\w\-_$]|:)/g, "$1var($2)");
					}
					this.#attr.push(`${key}="${escapeHTML(val)}"`);
				}
			});
		}
		if (arr && Array.isArray(arr)) {
			arr.forEach(key => {
				this.#attr.push(`${key}`);
			});
		}
		return this;
	}

	/**
	 * Adds attributes with project-certified smart handling (kebabization, styling fallback).
	 * Implements the V4 "Smart Styling Fallback" strategy.
	 * 
	 * @param {Object} args - Key-value pair of Smark arguments/attributes.
	 * @param {Set<string>} [customProps=new Set()] - Set of project-certified custom properties.
	 * @param {Object} [options={}] - Configuration flags (e.g., skipSmartHandling).
	 * @returns {TagBuilder} - Returns this instance for chaining.
	 */
	smartAttributes(args, customProps = new Set(), options = {}) {
		if (!args || typeof args !== "object") return this;

		const id = this.tagName.toLowerCase();
		const isCodeStyleOrScript = ["style", "script"].includes(id);
		let inline_style = "";

		// 1. Initial CSS Variable/Style processing
		if (!isCodeStyleOrScript && args.style) {
			if (typeof args.style === "object") {
				inline_style = Object.entries(args.style)
					.map(([k, v]) => `${kebabize(k)}:${v}`)
					.join(";") + (Object.keys(args.style).length > 0 ? ";" : "");
			} else if (typeof args.style === "string") {
				inline_style = args.style.endsWith(";") ? args.style : args.style + ";";
			} else {
				inline_style = String(args.style) + ";";
			}
		}

		// 2. Attribute Dispatching
		const keys = Object.keys(args).filter(arg => isNaN(parseInt(arg)));
		keys.forEach(key => {
			if (!isNaN(parseInt(key))) return; // Skip numeric positional arguments
			if (key === "style") return;
			if (isCodeStyleOrScript && key === "scoped") return;

			const isDimensionAttributeSupported = ["img", "video", "svg", "canvas", "iframe", "object", "embed"].includes(id);
			const isWidthOrHeight = key === "width" || key === "height";
			const isEvent = key.toLowerCase().startsWith("on");
			const isNative = HTML_PROPS.has(key);
			const isCustom = customProps.has(key) || customProps.has(kebabize(key));
			const isDataOrAria = kebabize(key).startsWith("data-") || kebabize(key).startsWith("aria-");

			const k = isEvent ? key.toLowerCase() : (isNative || isCustom) ? key : kebabize(key);

			if (isCodeStyleOrScript) {
				// Specialized tags: only render standard attributes, no styling fallback
				this.#attr.push(`${k}="${escapeHTML(String(args[key]))}"`);
			} else {
				// Standard elements: process smart styling fallbacks for non-native props
				if (isEvent || ((isNative || isCustom) && (!isWidthOrHeight || isDimensionAttributeSupported)) || isDataOrAria) {
					const val = typeof args[key] === "object" ? JSON.stringify(args[key]) : args[key];
					this.#attr.push(`${k}="${escapeHTML(String(val))}"`);
				} else {
					const val = typeof args[key] === "object" ? JSON.stringify(args[key]) : args[key];
					inline_style += `${k}:${val};`;
				}
			}
		});

		if (inline_style) {
			// V4 DYNAMIC CSS: Automatically wrap CSS variables in var()
			const processedStyle = inline_style.replace(/(^|[^\w\-_$])(--[\w\-_$]+)(?![\w\-_$]|:)/g, "$1var($2)");
			this.#attr.push(`style="${escapeHTML(processedStyle)}"`);
		}

		return this;
	}

	/**
	 * Converts SomMark arguments into JSX props and applies them to the tag.
	 * Implements smart handling for className, style objects, and automated JSX expression wrapping.
	 * 
	 * @param {Object} args - The list of arguments.
	 * @returns {TagBuilder} - Returns this instance for chaining.
	 */
	jsxProps(args) {
		if (!args || typeof args !== "object") return this;

		const jsxProps = [];
		const styleObj = {};

		const keys = Object.keys(args).filter(arg => isNaN(parseInt(arg)));
		keys.forEach(key => {
			let val = args[key];

			let k = key;
			if (k === "class") k = "className";

			// Strip quotes from string literals if they were passed raw
			if (typeof val === "string" && ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))) {
				val = val.slice(1, -1);
			}

			if (k === "style") {
				// Convert CSS strings to React-style objects
				if (typeof val === "string") {
					const pairs = val.includes(";") ? val.split(";") : val.split(",");
					pairs.forEach(pair => {
						let [prop, value] = pair.split(":").map(s => s.trim());
						if (prop && value) {
							const camelProp = prop.replace(/-([a-z])/g, g => g[1].toUpperCase());
							styleObj[camelProp] = value;
						}
					});
				} else if (typeof val === "object") {
					Object.assign(styleObj, val);
				}
			} else {
				// Detect if it should be wrapped in {} (JSX Expression)
				const isObject = typeof val === "object" && val !== null;
				const isBoolean = typeof val === "boolean" || val === "true" || val === "false";
				const isNumeric = typeof val === "number" || (typeof val === "string" && val !== "" && !isNaN(val));
				const isWrappedInBraces = typeof val === "string" && val.startsWith("{") && val.endsWith("}");

				const shouldBeJSXExpression = isObject || isBoolean || isNumeric || isWrappedInBraces;

				let finalVal = val;
				if (val === "true") finalVal = true;
				if (val === "false") finalVal = false;
				if (typeof val === "string" && isNumeric) finalVal = Number(val);

				if (isWrappedInBraces) {
					// Strip outer braces: {theme} -> theme
					finalVal = val.slice(1, -1);
				} else if (isObject) {
					// Clean JS string for JSX: { a: 1 } instead of {"a":1}
					finalVal = JSON.stringify(val).replace(/"([^"]+)":/g, "$1:");
				}

				jsxProps.push({
					__type__: shouldBeJSXExpression ? "other" : "string",
					[k]: finalVal
				});
			}
		});

		if (Object.keys(styleObj).length > 0) {
			const styleStr = JSON.stringify(styleObj).replace(/"([^"]+)":/g, "$1:");
			jsxProps.push({ __type__: "other", style: styleStr });
		}

		// Use the legacy props helper to apply the generated list
		this.props(jsxProps);
		return this;
	}

	/**
	 * Internal helper to apply MDX-style property entries.
	 * Note: This method no longer returns 'this' and is removed from the chain.
	 * Use .jsxProps(args) instead.
	 * 
	 * @param {Object|Array} propsList - The property entries to add.
	 */
	props(propsList) {
		const list = Array.isArray(propsList) ? propsList : [propsList];
		if (list.length > 0) {
			for (const propEntry of list) {
				if (typeof propEntry !== "object" || propEntry === null || !Object.prototype.hasOwnProperty.call(propEntry, "__type__")) {
					continue;
				}

				const { __type__, ...rest } = propEntry;
				const entries = Object.entries(rest);
				if (entries.length === 0) continue;

				const [key, value] = entries[0];
				switch (__type__) {
					case "string":
						this.#attr.push(`${key}="${escapeHTML(String(value))}"`);
						break;
					case "other":
						this.#attr.push(`${key}={${value}}`);
						break;
				}
			}
		}
	}

	/**
	 * Sets the body content of the tag. 
	 * Note: Calling this method finalizes the builder state by returning the generated string.
	 * @param {string|Array} nodes - The inner content of the tag.
	 * @returns {string} - The generated HTML string.
	 */
	body(nodes) {
		if (nodes) {
			let space = this.#children ? " " : "";
			this.#children += space + nodes;
		}
		return this.builder();
	}

	/**
	 * Marks the tag as self-closing (e.g., <img />).
	 * Note: Calling this method finalizes the builder state by returning the generated string.
	 * @returns {string} - The generated HTML string.
	 */
	selfClose() {
		this.#is_self_close = true;
		return this.builder();
	}

	/**
	 * Internal method to construct the final tag string.
	 * @private
	 * @returns {string} - The generated HTML string.
	 */
	builder() {
		const props = this.#attr.length > 0 ? " " + this.#attr.join(" ") : "";
		if (this.#is_self_close) {
			return `<${this.tagName}${props} />`;
		}
		return `<${this.tagName}${props}>${this.#children}</${this.tagName}>`;
	}
}
export default TagBuilder;
