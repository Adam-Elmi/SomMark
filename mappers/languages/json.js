import Mapper from "../mapper.js";
import { getPositionalArgs, safeArg } from "../../helpers/utils.js";
import { transpilerError } from "../../core/errors.js";

const ITEM_SEP = "\x1F";

export function getIndent(depth) {
	return "  ".repeat(depth);
}

export function escapeString(str, trim = false) {
	let out = String(str);
	if (trim) out = out.trim();
	return JSON.stringify(out);
}

export function renderMember(props, value, inArray = false) {
	if (inArray) return value + ITEM_SEP;
	const posArgs = getPositionalArgs(props);
	const key = props.key || posArgs[0];
	if (key) return `${escapeString(key)}: ${value}` + ITEM_SEP;
	return value;
}

const Json = Mapper.define({});

Json.register(["Object", "object"], async function ({ props, ast, depth = 0, inArray = false, renderChild }) {
	let combined = "";
	for (const child of ast.body) {
		const out = await renderChild(child, { depth: depth + 1, inArray: false });
		if (out) combined += out;
	}
	const parts = combined.split(ITEM_SEP).map(v => v.trim()).filter(v => v !== "");
	const value = parts.length === 0
		? "{}"
		: `{\n${parts.map(p => getIndent(depth + 1) + p).join(",\n")}\n${getIndent(depth)}}`;
	return renderMember(props, value, inArray);
}, { handleAst: true });

Json.register(["Array", "array"], async function ({ props, ast, depth = 0, inArray = false, renderChild }) {
	let combined = "";
	for (const child of ast.body) {
		const out = await renderChild(child, { depth: depth + 1, inArray: true });
		if (out) combined += out;
	}
	const parts = combined.split(ITEM_SEP).map(v => v.trim()).filter(v => v !== "");
	const value = parts.length === 0
		? "[]"
		: `[\n${parts.map(p => getIndent(depth + 1) + p).join(",\n")}\n${getIndent(depth)}]`;
	return renderMember(props, value, inArray);
}, { handleAst: true });

Json.register(["string", "str"], ({ props, textContent, inArray }) => {
	const trim = safeArg({
		props,
		key: "trim",
		type: "boolean",
		setType: v => v === "true" || v === true,
		fallBack: false
	});
	const raw = safeArg({ props, index: inArray ? 0 : undefined, key: "value", fallBack: textContent });
	return renderMember(props, escapeString(raw, trim), inArray);
}, { handleAst: true });

Json.register("number", ({ props, textContent, inArray }) => {
	const raw = String(safeArg({ props, index: inArray ? 0 : undefined, key: "value", fallBack: textContent })).trim();
	const val = (isNaN(Number(raw)) || raw === "") ? "0" : raw;
	return renderMember(props, val, inArray);
}, { handleAst: true });

Json.register("bool", ({ props, textContent, inArray }) => {
	const raw = String(safeArg({ props, index: inArray ? 0 : undefined, key: "value", fallBack: textContent })).trim().toLowerCase();
	return renderMember(props, (raw === "true" || raw === "1") ? "true" : "false", inArray);
}, { handleAst: true });

Json.register("null", ({ props, inArray }) => {
	return renderMember(props, "null", inArray);
}, { handleAst: true });

Json.getUnknownTag = function (node) {
	const key = node.id;
	return {
		render({ props, textContent, inArray = false }) {
			if (inArray) {
				transpilerError(
					`Unknown tag '<$yellow:[${key}]$>' cannot be used inside <$yellow:[Array]$>.{N}Use <$cyan:[string]$>, <$cyan:[number]$>, <$cyan:[bool]$>, or <$cyan:[null]$> instead.`
				);
			}
			const raw = String(
				safeArg({ props, index: 0, key: "value", fallBack: textContent.trim() })
			).trim();
			let val;
			if (raw === "null")                             val = "null";
			else if (raw === "true" || raw === "false")     val = raw;
			else if (raw !== "" && !isNaN(Number(raw)))     val = raw;
			else                                            val = escapeString(raw);
			return `${escapeString(key)}: ${val}` + ITEM_SEP;
		},
		options: { handleAst: true }
	};
};

export default Json;
