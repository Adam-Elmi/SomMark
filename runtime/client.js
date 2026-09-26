// ###################
// ArcMoon in the browser: refs, live values, one run per use
// ###################

let comments = null;

// ###################
// <!--arcm:id--> comments that mark live text
// ###################
const liveComment = (id) => {
	if (!comments) {
		comments = new Map();
		const walker = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT);
		for (let n = walker.nextNode(); n; n = walker.nextNode()) {
			if (n.data.startsWith("arcm:")) comments.set(n.data.slice(5), n);
		}
	}
	return comments.get(id);
};

const byRef = (id) => [...document.querySelectorAll(`[data-arcm-ref="${id}"]`)];

// ###################
// Set an attribute the same way the compiler writes it
// ###################
const setAttr = (el, name, value) => {
	if (name === "value" || name === "checked") el[name] = value;
	if (value === null || value === undefined || value === false) el.removeAttribute(name);
	else el.setAttribute(name, value === true ? "" : String(value));
};

export const run = (fn, use) => {
	const ArcMoon = Object.freeze({
		version: use.version,
		defineRef(name) {
			const ref = use.refs[name];
			if (!ref) throw new Error(`defineRef("${name}"): no element has arcm-ref "${name}"`);
			return ref;
		},
		ref(ref) {
			if (ref.shared) throw new Error(`"${ref.name}" is a shared ref; use ArcMoon.refs()`);
			return byRef(ref.id)[0] ?? null;
		},
		refs(ref) {
			if (!ref.shared) throw new Error(`"${ref.name}" is a single ref; use ArcMoon.ref()`);
			return byRef(ref.id);
		}
	});

	const live = (k, bind) => {
		for (const target of use.live[k] ?? []) {
			if (target.text) {
				// ###################
				// Live text sits between <!--arcm:id--> and <!--/arcm-->
				// ###################
				const mark = liveComment(target.id);
				if (!mark) continue;
				while (mark.nextSibling && !(mark.nextSibling.nodeType === Node.COMMENT_NODE && mark.nextSibling.data === "/arcm")) {
					mark.nextSibling.remove();
				}
				const node = document.createTextNode("");
				mark.after(node);
				bind(node);
			} else {
				const el = byRef(target.id)[0];
				if (el) bind(el);
			}
		}
	};

	try {
		fn(ArcMoon, use.values, live, setAttr);
	} catch (err) {
		console.error(`ArcMoon runtime error in ${use.file}`, err);
	}
};
