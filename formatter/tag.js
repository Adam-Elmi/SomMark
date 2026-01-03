class TagBuilder {
	#children;
	#attr;
	#is_self_close;
	constructor(tagName) {
		this.tagName = tagName;
		this.#children = "";
		this.#attr = [];
		this.#is_self_close = false;
	}
	attributes(obj, ...arr) {
		if (obj && obj instanceof Object) {
			Object.entries(obj).forEach(([key, value]) => {
				this.#attr.push(`${key}="${ value ?? ""}"`);
			});
		}
		if (arr && Array.isArray(arr)) {
			arr.forEach(key => {
				this.#attr.push(`${key}`);
			});
		}
		return this;
	}
	props(propsList) {
		if (Array.isArray(propsList) && propsList.length > 0) {
			for (const prop of propsList) {
				if (typeof prop !== "object" || prop === null || !Object.prototype.hasOwnProperty.call(prop, "type")) {
					throw new TypeError("prop expects an object with property { type }");
				}
				const [_, key2] = Object.keys(prop);
				const [type, value] = Object.values(prop);
				if (prop && type) {
					switch (type) {
						case "string":
							this.#attr.push(`${key2}="${value}"`);
							break;
						case "other":
							this.#attr.push(`${key2}={${value}}`);
							break;
					}
				}
			}
			return this;
		}
	}
	body(nodes) {
		if (nodes) {
			let space = this.#children ? " " : "";
			this.#children += space + nodes;
		}
		return this.builder();
	}
	selfClose() {
		this.#is_self_close = true;
		return this.builder();
	}
	builder() {
		const components = {
			lt: "<",
			gt: ">",
			slash: "/",
			name: this.tagName,
			props: this.#attr.join(" "),
			inner: this.#children
		};
		const { lt, gt, slash, name, props, inner } = components;
		return `${lt}${name}${props ? " " + props : ""}${this.#is_self_close ? "" : gt}${this.#is_self_close ? "" : inner}${this.#is_self_close ? " " : lt}${slash}${this.#is_self_close ? "" : name}${gt}`;
	}
}
export default TagBuilder;
