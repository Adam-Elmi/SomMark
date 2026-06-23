import Mapper from "../mapper.js";
import { safeArg } from "../../helpers/utils.js";
import { registerSharedOutputs } from "../shared/index.js";
import { transpilerError } from "../../core/errors.js";

const isValidInt    = (v) => v !== "" && !isNaN(Number(v)) && !v.includes(".");
const isValidFloat  = (v) => v !== "" && !isNaN(Number(v)) && v.includes(".");
const isValidNumber = (v) => v !== "" && !isNaN(Number(v));

const ITEM_SEP = "\x1F";

const getIndent = (depth) => "  ".repeat(depth);

// Escape a string value for use inside YAML double-quoted scalars
const yamlEscape = (str) =>
	String(str ?? "")
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "\\r")
		.replace(/\t/g, "\\t");

// Always double-quote string values — [str] is explicitly typed, no ambiguity needed
const yamlStr = (val) => `"${yamlEscape(val)}"`;

// Bare keys: [A-Za-z0-9_-] are safe without quoting
const yamlKey = (key) => {
	const s = String(key ?? "");
	return /^[A-Za-z0-9_\-]+$/.test(s) ? s : `"${yamlEscape(s)}"`;
};

const YAML = Mapper.define({
	comment(text) {
		return `# ${text}`;
	},
	text(text) {
		return text.trim() === "" ? "" : text;
	}
});

/**
 * [str] / [string] — string scalar
 *
 * Key-value:    [str = "name", "SomMark" !]            → name: "SomMark"
 * Body form:    [str = "desc"]Long text[end]           → desc: "Long text"
 * In sequence:  [str = "rust" !]                       → - "rust"
 * In map-item:  [str = "host", "localhost" !]          → host: "localhost"  (no indent, feeds [map-item])
 */
YAML.register(["str", "string"], ({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) => {
	if (inSeq) {
		const val = safeArg({ props, index: 0, key: "value", fallBack: textContent.trim() });
		return `${getIndent(depth)}- ${yamlStr(val)}\n`;
	}
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	const val = safeArg({ props, index: 1, key: "value", fallBack: textContent.trim() });
	if (inMapItem) return `${yamlKey(key)}: ${yamlStr(val)}${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: ${yamlStr(val)}\n`;
}, { handleAst: true });

/**
 * [int] / [integer] — integer scalar
 *
 * Key-value:    [int = "port", "5432" !]   → port: 5432
 * In sequence:  [int = "8001" !]           → - 8001
 */
YAML.register(["int", "integer"], ({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) => {
	const val = String(safeArg({ props, index: inSeq ? 0 : 1, key: "value", fallBack: textContent.trim() })).trim();
	if (!isValidInt(val))
		transpilerError(`<$yellow:[int]$> expects a whole number but got <$yellow:'${val}'$>.{N}Use <$cyan:[float]$> for decimal numbers or <$cyan:[number]$> for either.`);
	if (inSeq) return `${getIndent(depth)}- ${val}\n`;
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	if (inMapItem) return `${yamlKey(key)}: ${val}${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: ${val}\n`;
}, { handleAst: true });

YAML.register("float", ({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) => {
	const val = String(safeArg({ props, index: inSeq ? 0 : 1, key: "value", fallBack: textContent.trim() })).trim();
	if (!isValidFloat(val))
		transpilerError(`<$yellow:[float]$> expects a decimal number but got <$yellow:'${val}'$>.{N}Use <$cyan:[int]$> for whole numbers or <$cyan:[number]$> for either.`);
	if (inSeq) return `${getIndent(depth)}- ${val}\n`;
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	if (inMapItem) return `${yamlKey(key)}: ${val}${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: ${val}\n`;
}, { handleAst: true });

YAML.register("number", ({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) => {
	const val = String(safeArg({ props, index: inSeq ? 0 : 1, key: "value", fallBack: textContent.trim() })).trim();
	if (!isValidNumber(val))
		transpilerError(`<$yellow:[number]$> expects a numeric value but got <$yellow:'${val}'$>.`);
	if (inSeq) return `${getIndent(depth)}- ${val}\n`;
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	if (inMapItem) return `${yamlKey(key)}: ${val}${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: ${val}\n`;
}, { handleAst: true });

/**
 * [bool] / [boolean] — boolean scalar
 *
 * Key-value:    [bool = "debug", "false" !]   → debug: false
 * In sequence:  [bool = "true" !]             → - true
 */
YAML.register(["bool", "boolean"], ({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) => {
	const raw = String(
		inSeq
			? safeArg({ props, index: 0, key: "value", fallBack: textContent.trim() })
			: safeArg({ props, index: 1, key: "value", fallBack: textContent.trim() })
	).trim().toLowerCase();
	const val = (raw === "true" || raw === "1" || raw === "yes") ? "true" : "false";
	if (inSeq) return `${getIndent(depth)}- ${val}\n`;
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	if (inMapItem) return `${yamlKey(key)}: ${val}${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: ${val}\n`;
}, { handleAst: true });

/**
 * [null] — null scalar
 *
 * Key-value:    [null = "missing" !]   → missing: null
 * In sequence:  [null !]               → - null
 */
YAML.register("null", ({ props, depth = 0, inSeq = false, inMapItem = false }) => {
	if (inSeq) return `${getIndent(depth)}- null\n`;
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	if (inMapItem) return `${yamlKey(key)}: null${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: null\n`;
}, { handleAst: true });

/**
 * [mapping] / [map] — block mapping (YAML object)
 *
 * [mapping = "database"]
 *   [str = "host", "localhost" !]
 *   [int = "port", "5432" !]
 * [end]
 *
 * →
 *
 * database:
 *   host: "localhost"
 *   port: 5432
 *
 * Omit the key for a root mapping.
 * Supports [for-each] inside — each iteration's lines are pre-indented and concatenate correctly.
 */
YAML.register(["mapping", "map"], async ({ props, ast, depth = 0, renderChild }) => {
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	const childDepth = key ? depth + 1 : depth;
	let body = "";
	for (const child of ast.body) {
		body += await renderChild(child, { depth: childDepth });
	}
	if (!key) return body;
	return `${getIndent(depth)}${yamlKey(key)}:\n${body}`;
}, { handleAst: true });

/**
 * [seq] / [sequence] / [list] — block sequence (YAML array of scalars)
 *
 * Scalar items use [str], [int], [bool], [float], [null].
 * Mapping items use [map-item].
 *
 * [seq = "tags"]
 *   [str = "rust" !]
 *   [str = "cli" !]
 * [end]
 *
 * →
 *
 * tags:
 *   - "rust"
 *   - "cli"
 *
 * Supports [for-each] inside naturally.
 */
YAML.register(["seq", "sequence", "list"], async ({ props, ast, depth = 0, renderChild }) => {
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	let body = "";
	for (const child of ast.body) {
		body += await renderChild(child, { depth: depth + 1, inSeq: true });
	}
	if (!key) return body;
	return `${getIndent(depth)}${yamlKey(key)}:\n${body}`;
}, { handleAst: true });

/**
 * [map-item] — mapping as a sequence item (used inside [seq])
 *
 * Each child scalar renders a bare "key: value" pair (no indent).
 * [map-item] assembles them with the correct "- " prefix on the first pair
 * and aligned indentation for the rest.
 *
 * [seq = "servers"]
 *   [map-item]
 *     [str = "host", "10.0.0.1" !]
 *     [int = "port", "8001" !]
 *   [end]
 * [end]
 *
 * →
 *
 * servers:
 *   - host: "10.0.0.1"
 *     port: 8001
 */
YAML.register("map-item", async ({ props, ast, depth = 0, renderChild }) => {
	let combined = "";
	for (const child of ast.body) {
		combined += await renderChild(child, { depth: 0, inMapItem: true });
	}
	const pairs = combined.split(ITEM_SEP).map(v => v.trim()).filter(v => v !== "");
	if (pairs.length === 0) return "";
	const seqIndent  = getIndent(depth);
	const bodyIndent = getIndent(depth) + "  ";
	const [first, ...rest] = pairs;
	const restLines = rest.length > 0 ? `\n${rest.map(p => `${bodyIndent}${p}`).join("\n")}` : "";
	return `${seqIndent}- ${first}${restLines}\n`;
}, { handleAst: true });

/**
 * [literal] / [lit] — literal block scalar (|)
 * Preserves newlines exactly as written.
 *
 * [literal = "script"]
 *   echo "hello"
 *   echo "world"
 * [end]
 *
 * →
 *
 * script: |
 *   echo "hello"
 *   echo "world"
 */
YAML.register(["literal", "lit"], ({ props, textContent, depth = 0, inMapItem = false }) => {
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	const childIndent = getIndent(depth + 1);
	const lines = textContent
		.split("\n")
		.map(l => l.trim())
		.filter((l, i, a) => !(i === 0 && l === "") && !(i === a.length - 1 && l === ""))
		.map(l => l === "" ? "" : `${childIndent}${l}`)
		.join("\n");
	if (inMapItem) return `${yamlKey(key)}: |\n${lines}\n${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: |\n${lines}\n`;
}, { handleAst: true });

/**
 * [folded] / [fold] — folded block scalar (>)
 * Newlines become spaces; blank lines become paragraph breaks.
 *
 * [folded = "description"]
 *   This is a long
 *   description.
 * [end]
 *
 * →
 *
 * description: >
 *   This is a long
 *   description.
 */
YAML.register(["folded", "fold"], ({ props, textContent, depth = 0, inMapItem = false }) => {
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	const childIndent = getIndent(depth + 1);
	const lines = textContent
		.split("\n")
		.map(l => l.trim())
		.filter((l, i, a) => !(i === 0 && l === "") && !(i === a.length - 1 && l === ""))
		.map(l => l === "" ? "" : `${childIndent}${l}`)
		.join("\n");
	if (inMapItem) return `${yamlKey(key)}: >\n${lines}\n${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: >\n${lines}\n`;
}, { handleAst: true });

/**
 * Unknown tag — tag name becomes the YAML key, first positional arg is the value.
 * Type is inferred: number → raw, true/false → boolean, everything else → quoted string.
 *
 * [greeting = "Hello" !]    → greeting: "Hello"
 * [price = 99.99 !]         → price: 99.99
 * [active = true !]         → active: true
 * [label]My text[end]       → label: "My text"
 */
YAML.getUnknownTag = function (node) {
	const key = node.id;
	return {
		render({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) {
			const raw = String(
				safeArg({ props, index: 0, key: "value", fallBack: textContent.trim() })
			).trim();

			let val;
			if (raw === "true" || raw === "false") {
				val = raw;
			} else if (raw !== "" && !isNaN(Number(raw))) {
				val = raw;
			} else {
				val = yamlStr(raw);
			}

			if (inSeq) return `${getIndent(depth)}- ${val}\n`;
			if (inMapItem) return `${yamlKey(key)}: ${val}${ITEM_SEP}`;
			return `${getIndent(depth)}${yamlKey(key)}: ${val}\n`;
		},
		options: { handleAst: true }
	};
};

/**
 * [doc-start] — YAML document start marker (---)
 * [doc-start !]  →  ---
 */
YAML.register("doc-start", () => "---\n", { rules: { is_empty_body: true } });

/**
 * [doc-end] — YAML document end marker (...)
 * [doc-end !]  →  ...
 */
YAML.register("doc-end", () => "...\n", { rules: { is_empty_body: true } });

registerSharedOutputs(YAML);

export default YAML;
