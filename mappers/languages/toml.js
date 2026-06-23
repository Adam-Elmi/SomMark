import Mapper from "../mapper.js";
import { safeArg } from "../../helpers/utils.js";
import { registerSharedOutputs } from "../shared/index.js";
import { transpilerError } from "../../core/errors.js";

const isValidInt    = (v) => v !== "" && !isNaN(Number(v)) && !v.includes(".");
const isValidFloat  = (v) => v !== "" && !isNaN(Number(v)) && v.includes(".");
const isValidNumber = (v) => v !== "" && !isNaN(Number(v));

// Escape a string value for use inside TOML basic strings
const tomlEscapeString = (str) =>
	String(str ?? "")
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\x08/g, "\\b")
		.replace(/\f/g, "\\f")
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "\\r")
		.replace(/\t/g, "\\t");

// Quote a bare key segment if it contains characters outside [A-Za-z0-9_-]
const toBareKey = (k) => /^[A-Za-z0-9_-]+$/.test(k) ? k : `"${tomlEscapeString(k)}"`;

// Handle dotted keys like "database.host" → database.host
const tomlKey = (key) => String(key).split(".").map(toBareKey).join(".");

const ITEM_SEP = "\x1F";

const TOML = Mapper.define({
	comment(text) {
		return `# ${text}`;
	},
	text(text) {
		return text.trim() === "" ? "" : text;
	}
});

/**
 * [str] / [string] — string key-value pair or array string value
 *
 * Key-value:  [str = "title", "My App" !]         → title = "My App"
 * Body form:  [str = "description"]Long text[end] → description = "Long text"
 * In array:   [str = "hello" !]                   → "hello"
 */
TOML.register(["str", "string"], ({ props, textContent, inArray = false }) => {
	const value = inArray
		? safeArg({ props, index: 0, key: "value", fallBack: textContent.trim() })
		: safeArg({ props, index: 1, key: "value", fallBack: textContent.trim() });
	const escaped = `"${tomlEscapeString(String(value))}"`;
	if (inArray) return escaped + ITEM_SEP;
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	return `${tomlKey(key)} = ${escaped}\n`;
}, { handleAst: true });

/**
 * [int] / [integer] — integer key-value pair or array integer value
 *
 * Key-value:  [int = "port", "5432" !]  → port = 5432
 * In array:   [int = "5432" !]          → 5432
 */
TOML.register(["int", "integer"], ({ props, textContent, inArray = false }) => {
	const raw = String(safeArg({ props, index: inArray ? 0 : 1, key: "value", fallBack: textContent.trim() })).trim();
	if (!isValidInt(raw))
		transpilerError(`<$yellow:[int]$> expects a whole number but got <$yellow:'${raw}'$>.{N}Use <$cyan:[float]$> for decimal numbers or <$cyan:[number]$> for either.`);
	if (inArray) return raw + ITEM_SEP;
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	return `${tomlKey(key)} = ${raw}\n`;
}, { handleAst: true });

TOML.register("float", ({ props, textContent, inArray = false }) => {
	const raw = String(safeArg({ props, index: inArray ? 0 : 1, key: "value", fallBack: textContent.trim() })).trim();
	if (!isValidFloat(raw))
		transpilerError(`<$yellow:[float]$> expects a decimal number but got <$yellow:'${raw}'$>.{N}Use <$cyan:[int]$> for whole numbers or <$cyan:[number]$> for either.`);
	if (inArray) return raw + ITEM_SEP;
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	return `${tomlKey(key)} = ${raw}\n`;
}, { handleAst: true });

TOML.register("number", ({ props, textContent, inArray = false }) => {
	const raw = String(safeArg({ props, index: inArray ? 0 : 1, key: "value", fallBack: textContent.trim() })).trim();
	if (!isValidNumber(raw))
		transpilerError(`<$yellow:[number]$> expects a numeric value but got <$yellow:'${raw}'$>.`);
	if (inArray) return raw + ITEM_SEP;
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	return `${tomlKey(key)} = ${raw}\n`;
}, { handleAst: true });

/**
 * [bool] / [boolean] — boolean key-value pair or array bool value
 *
 * Key-value:  [bool = "debug", "false" !]  → debug = false
 * In array:   [bool = "true" !]            → true
 */
TOML.register(["bool", "boolean"], ({ props, textContent, inArray = false }) => {
	const raw = String(
		inArray
			? safeArg({ props, index: 0, key: "value", fallBack: textContent.trim() })
			: safeArg({ props, index: 1, key: "value", fallBack: textContent.trim() })
	).trim().toLowerCase();
	const value = (raw === "true" || raw === "1" || raw === "yes") ? "true" : "false";
	if (inArray) return value + ITEM_SEP;
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	return `${tomlKey(key)} = ${value}\n`;
}, { handleAst: true });

/**
 * [datetime] — datetime key-value pair
 * TOML datetimes are bare (unquoted): 1979-05-27T07:32:00Z
 *
 * [datetime = "born", "1979-05-27T07:32:00Z" !]  → born = 1979-05-27T07:32:00Z
 */
TOML.register("datetime", ({ props, textContent, inArray = false }) => {
	const raw = String(
		inArray
			? safeArg({ props, index: 0, key: "value", fallBack: textContent.trim() })
			: safeArg({ props, index: 1, key: "value", fallBack: textContent.trim() })
	).trim();
	if (inArray) return raw + ITEM_SEP;
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	return `${tomlKey(key)} = ${raw}\n`;
}, { handleAst: true });

/**
 * [table] / [section] — renders a TOML table header + children
 *
 * [table = "database"]
 *   [str = "host", "localhost" !]
 *   [int = "port", "5432" !]
 * [end]
 *
 * →
 *
 * [database]
 * host = "localhost"
 * port = 5432
 */
TOML.register(["table", "section"], async ({ props, ast, renderChild }) => {
	const name = safeArg({ props, index: 0, key: "name", fallBack: "" });
	const parts = [];
	for (const child of ast.body) {
		const out = await renderChild(child);
		if (out != null && out.trim() !== "") parts.push(out);
	}
	return `[${tomlKey(name)}]\n${parts.join("")}\n`;
}, { handleAst: true });

/**
 * [array-table] — renders a TOML array of tables entry
 *
 * [array-table = "servers"]
 *   [str = "name", "alpha" !]
 *   [str = "ip", "10.0.0.1" !]
 * [end]
 *
 * →
 *
 * [[servers]]
 * name = "alpha"
 * ip = "10.0.0.1"
 */
TOML.register("array-table", async ({ props, ast, renderChild }) => {
	const name = safeArg({ props, index: 0, key: "name", fallBack: "" });
	const parts = [];
	for (const child of ast.body) {
		const out = await renderChild(child);
		if (out != null && out.trim() !== "") parts.push(out);
	}
	return `[[${tomlKey(name)}]]\n${parts.join("")}\n`;
}, { handleAst: true });

/**
 * [array] — renders a TOML inline array
 * Children are rendered with inArray: true so they output just their value.
 *
 * [array = "ports"]
 *   [int = "8001" !][int = "8002" !][int = "8003" !]
 * [end]
 *
 * → ports = [8001, 8002, 8003]
 *
 * Works with [for-each] for dynamic arrays:
 * [array = "tags"]
 *   [for-each = ${ tags }$, as: "item"][str = ${ item }$ !][end]
 * [end]
 */
/**
 * Unknown tag — tag name becomes the TOML key, first positional arg is the value.
 * Type is inferred: number → raw integer/float, true/false → boolean, everything else → quoted string.
 *
 * [name = "Adam" !]    → name = "Adam"
 * [port = 5432 !]      → port = 5432
 * [debug = false !]    → debug = false
 * [bio]Long text[end]  → bio = "Long text"
 */
TOML.getUnknownTag = function (node) {
	const key = node.id;
	return {
		render({ props, textContent, inArray = false }) {
			const raw = String(
				safeArg({ props, index: 0, key: "value", fallBack: textContent.trim() })
			).trim();

			let val;
			if (raw === "true" || raw === "false") {
				val = raw;
			} else if (raw !== "" && !isNaN(Number(raw))) {
				val = raw;
			} else {
				val = `"${tomlEscapeString(raw)}"`;
			}

			if (inArray) return val + ITEM_SEP;
			return `${tomlKey(key)} = ${val}\n`;
		},
		options: { handleAst: true }
	};
};

TOML.register("array", async ({ props, ast, renderChild }) => {
	const key = safeArg({ props, index: 0, key: "key", fallBack: "" });
	let combined = "";
	for (const child of ast.body) {
		combined += await renderChild(child, { inArray: true });
	}
	const vals = combined.split(ITEM_SEP).filter(v => v.trim() !== "");
	return `${tomlKey(key)} = [${vals.join(", ")}]\n`;
}, { handleAst: true });

registerSharedOutputs(TOML);

export default TOML;
