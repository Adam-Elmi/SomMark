import TagBuilder from "../formatter/tag.js";
import MarkdownBuilder from "../formatter/mark.js";
import escapeHTML from "../helpers/escapeHTML.js";
import { sommarkError } from "../core/errors.js";
import { matchedValue, safeArg } from "../helpers/utils.js";


// ========================================================================== //
//  Main Mapper Class                                                         //
// ========================================================================== //
class Mapper {
	#customHeaderContent;
	// ========================================================================== //
	//  Constructor                                                               //
	// ========================================================================== //
	constructor() {
		this.outputs = [];
		this.md = new MarkdownBuilder();

		this.extraProps = new Set(); // For plugins to add recognized arguments

		this.pageProps = {
			pageTitle: "SomMark Page",
			tabIcon: {
				type: "image/x-icon",
				src: ""
			},
			charset: "UTF-8",
			viewport: "width=device-width, initial-scale=1.0",
			httpEquiv: { "X-UA-Compatible": "IE=edge" }
		};

		this.#customHeaderContent = "";

		this.escapeHTML = escapeHTML;
		this.styles = [];
	}

	// ========================================================================== //
	//  Style Management                                                          //
	// ========================================================================== //

	addStyle(css) {
		if (typeof css === "object" && css !== null) {
			let styleString = "";
			for (const [selector, rules] of Object.entries(css)) {
				let rulesString = "";
				for (const [prop, value] of Object.entries(rules)) {
					rulesString += `${prop}:${value};`;
				}
				styleString += `${selector}{${rulesString}}`;
			}
			css = styleString;
		}

		if (typeof css === "string" && css.trim() && !this.styles.includes(css.trim())) {
			this.styles.push(css.trim());
		}
	}


	// ========================================================================== //
	//  Header Generation                                                         //
	// ========================================================================== //
	get header() {
		const { pageTitle, tabIcon, charset, viewport, httpEquiv } = this.pageProps;

		let metas = "";
		metas += `${this.tag("meta").attributes({ charset }).selfClose()}\n`;
		metas += `${this.tag("meta").attributes({ name: "viewport", content: viewport }).selfClose()}\n`;

		for (const [key, value] of Object.entries(httpEquiv)) {
			metas += `${this.tag("meta").attributes({ "http-equiv": key, content: value }).selfClose()}\n`;
		}

		metas += `${this.tag("title").body(pageTitle)}\n`;

		if (tabIcon && tabIcon.src) {
			metas += `${this.tag("link").attributes({ rel: "icon", type: tabIcon.type, href: tabIcon.src }).selfClose()}\n`;
		}

		return metas + this.#customHeaderContent;
	}

	// ========================================================================== //
	//  Mappings                                                                  //
	// ========================================================================== //
	register(id, renderOutput, options = { escape: true }) {
		if (!id || !renderOutput) {
			throw new Error("Expected arguments are not defined");
		}

		if (typeof id !== "string" && !Array.isArray(id)) {
			throw new TypeError("argument 'id' expected to be a string or array");
		}

		if (typeof renderOutput !== "function") {
			throw new TypeError("argument 'renderOutput' expected to be a function");
		}
		const render = function (data) {
			if (
				typeof data !== "object" ||
				data === null ||
				!Object.prototype.hasOwnProperty.call(data, "args") ||
				!Object.prototype.hasOwnProperty.call(data, "content")
			) {
				throw new TypeError("render expects an object with properties { args, content }");
			}
			return renderOutput.call(this, data);
		};

		// Prevent duplicate IDs by removing any existing overlap before registering
		const ids = Array.isArray(id) ? id : [id];
		for (const singleId of ids) {
			this.removeOutput(singleId);
		}

		this.outputs.push({ id, render, options });
	}

	inherit(...mappers) {
		for (const mapper of mappers) {
			if (mapper && Array.isArray(mapper.outputs)) {
				for (const output of mapper.outputs) {
					const ids = Array.isArray(output.id) ? output.id : [output.id];
					for (const singleId of ids) {
						this.removeOutput(singleId);
					}
					this.outputs.push(output);
				}
			}
		}
	}

	removeOutput(id) {
		this.outputs = this.outputs.filter(output => {
			if (Array.isArray(output.id)) {
				return !output.id.some(singleId => singleId === id);
			} else {
				return output.id !== id;
			}
		});
	}

	get(id) {
		return matchedValue(this.outputs, id) || null;
	}

	// ========================================================================== //
	//  Helpers                                                                   //
	// ========================================================================== //
	comment(text) {
		return "";
	}
	getUnknownTag(node) {
		return null;
	}
	tag(tagName) {
		return new TagBuilder(tagName);
	}

	getCustomHeaderContent() {
		return this.#customHeaderContent;
	}

	setHeader(rawData) {
		if (Array.isArray(rawData)) {
			for (const data of rawData) {
				if (typeof data === "string") {
					this.#customHeaderContent += data + "\n";
				}
			}
		}
	}
	includesId(ids) {
		try {
			if (!Array.isArray(ids) || ids.length === 0) {
				return false;
			}

			if (!this.outputs || !Array.isArray(this.outputs)) {
				return false;
			}

			const searchSet = new Set(ids);

			for (const output of this.outputs) {
				if (!output || !output.id) {
					continue;
				}

				if (Array.isArray(output.id)) {
					if (output.id.some(id => searchSet.has(id))) {
						return true;
					}
				} else if (typeof output.id === "string" || typeof output.id === "number") {
					if (searchSet.has(output.id)) {
						return true;
					}
				}
			}

			return false;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	safeArg(args, index, key, type = null, setType = null, fallBack = null) {
		return safeArg(args, index, key, type, setType, fallBack);
	}

	clone() {
		const newMapper = new this.constructor();

		// Map-clone outputs to ensure options are isolated but render remains bound
		newMapper.outputs = this.outputs.map(out => ({
			...out,
			options: out.options ? { ...out.options } : { escape: true }
		}));

		newMapper.styles = [...this.styles];

		// deep clone pageProps
		newMapper.pageProps = JSON.parse(JSON.stringify(this.pageProps));

		newMapper.extraProps = new Set(this.extraProps);
		newMapper.setHeader([this.getCustomHeaderContent()]);
		return newMapper;
	}

	clear() {
		this.outputs = [];
	}

	formatOutput(output, includeDocument) {
		return output;
	}
}
export default Mapper;
