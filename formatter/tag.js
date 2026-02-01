import escapeHTML from "../helpers/escapeHTML.js";
class TagBuilder {
	#children;
	#attr;
	#is_self_close;
	// ========================================================================== //
	//  Constructor                                                               //
	// ========================================================================== //
	constructor(tagName) {
		this.tagName = tagName;
		this.#children = "";
		this.#attr = [];
		this.#is_self_close = false;
	}
	// ========================================================================== //
	//  Attributes                                                                //
	// ========================================================================== //
	attributes(obj, ...arr) {
		if (obj && obj instanceof Object) {
			Object.entries(obj).forEach(([key, value]) => {
				if (value === true) {
					this.#attr.push(`${key}`);
				} else if (value !== false) {
					this.#attr.push(`${key}="${escapeHTML(value ?? "")}"`);
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
	// ========================================================================== //
	//  Props                                                                     //
	// ========================================================================== //
	props(propsList) {
		const list = Array.isArray(propsList) ? propsList : [propsList];
		if (list.length > 0) {
			for (const propEntry of list) {
				if (typeof propEntry !== "object" || propEntry === null) {
					throw new TypeError("prop expects an object with property { type }");
				}

				if (!Object.prototype.hasOwnProperty.call(propEntry, "type")) {
					throw new TypeError("prop expects an object with property { type }");
				}

				const { type, ...rest } = propEntry;
				const entries = Object.entries(rest);

				if (entries.length === 0) {
					continue;
				}

				const [key, value] = entries[0];

				switch (type) {
					case "string":
						this.#attr.push(`${key}="${escapeHTML(String(value))}"`);
						break;
					case "other":
						this.#attr.push(`${key}={${value}}`);
						break;
				}
			}
		}
		return this;
	}
	// ========================================================================== //
	//  Body                                                                      //
	// ========================================================================== //
	body(nodes) {
		if (nodes) {
			let space = this.#children ? " " : "";
			this.#children += space + nodes;
		}
		return this.builder();
	}
	// ========================================================================== //
	//  Self Close                                                                //
	// ========================================================================== //
	selfClose() {
		this.#is_self_close = true;
		return this.builder();
	}
	// ========================================================================== //
	//  Builder                                                                   //
	// ========================================================================== //
	builder() {
		const props = this.#attr.length > 0 ? " " + this.#attr.join(" ") : "";
		if (this.#is_self_close) {
			return `<${this.tagName}${props} />`;
		}
		return `<${this.tagName}${props}>${this.#children}</${this.tagName}>`;
	}
}
export default TagBuilder;
