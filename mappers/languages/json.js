import Mapper from "../mapper.js";
import { TEXT } from "../../core/labels.js";
import { transpilerError } from "../../core/errors.js";

const Json = new Mapper();

// ========================================================================== //
//  Helpers                                                                   //
// ========================================================================== //

function escapeString(str) {
	return JSON.stringify(str);
}

function processNode(node, parentType = null) {
	if (!node) return "";

	if (node.id === "Object" || node.id === "Array" || node.id === "Json") {
		return renderBlock(node, parentType);
	} else if (["string", "number", "bool", "null", "array", "none"].includes(node.id)) {
		return renderInline(node, parentType);
	} else if (node.type === TEXT) {
		return "";
	}
	return "";
}

function renderBlock(node, parentType) {
	let output = "";
	let key = "";
	let isRoot = node.id === "Json";
	let type = node.id === "Array" || (isRoot && node.args.includes("array")) ? "array" : "object";

	// ========================================================================== //
	//  Key                                                                       //
	// ========================================================================== //
	if (!isRoot) {
		if (parentType === "object") {
			key = node.args && node.args[0] ? escapeString(node.args[0]) : null;
			if (!key) {
				key = '"unknown_key"';
			}
		}
	}

	// ========================================================================== //
	//  Children                                                                  //
	// ========================================================================== //
	let children = [];
	if (node.body && node.body.length > 0) {
		for (const child of node.body) {
			const childOutput = processNode(child, type);
			if (childOutput) {
				children.push(childOutput);
			}
		}
	}

	let content = children.join(",");
	let wrapper = type === "array" ? `[${content}]` : `{${content}}`;

	if (key) {
		return `${key}:${wrapper}`;
	} else {
		if (parentType === "object") {
			if (!node.args || !node.args[0]) {
				transpilerError([`{line}<$red:JSON Error:$> <$yellow:Blocks inside an Object must have a key argument.$>{line}`]);
			}
		}
		return wrapper;
	}
}

function renderInline(node, parentType) {
	let key = null;
	let value = "";

	// ========================================================================== //
	//  Value                                                                     //
	// ========================================================================== //
	if (node.id === "string") {
		if (!node.args || node.args.length === 0) {
			transpilerError([`{line}<$red:JSON Error:$> <$yellow:String inline must have a value.$>{line}`]);
		}
		value = escapeString(node.args[0] || "");
	} else if (node.id === "number") {
		if (!node.args || node.args.length === 0 || isNaN(Number(node.args[0]))) {
			transpilerError([`{line}<$red:JSON Error:$> <$yellow:Invalid or missing number value for inline.$>{line}`]);
		}
		value = node.args[0];
	} else if (node.id === "bool") {
		if (!node.args || (node.args[0] !== "true" && node.args[0] !== "false")) {
			transpilerError([`{line}<$red:JSON Error:$> <$yellow:Bool inline must be 'true' or 'false'.$>{line}`]);
		}
		value = node.args[0] === "true" ? "true" : "false";
	} else if (node.id === "null") {
		value = "null";
	} else if (node.id === "array") {
		// ========================================================================== //
		//  Inline array                                                              //
		// ========================================================================== //
		// (data)->(array: 1, 2, 3)
		// args = ["1", " 2", " 3"]
		const items = node.args.map(arg => {
			const trimmed = arg.trim();
			if (trimmed === "null") return "null";
			if (trimmed === "true" || trimmed === "false") return trimmed;
			if (!isNaN(parseFloat(trimmed)) && isFinite(trimmed)) return trimmed;
			return escapeString(trimmed);
		});
		value = `[${items.join(",")}]`;
	} else if (node.id === "none") {
		// Special case: (-)->(none: val)
		if (parentType === "object") {
			transpilerError([
				`{line}<$red:JSON Error:$> <$yellow:'none' inline is not allowed directly inside an Object. It must be inside an Array.$>{line}`
			]);
			return "";
		}

		// (-)->(none: 1, 2, null) -> [1, 2, null] -> args.length > 1
		// (-)->(none: true) -> true -> args.length == 1

		if (node.args.length > 1) {
			const items = node.args.map(arg => {
				const trimmed = arg.trim();
				if (trimmed === "null") return "null";
				if (trimmed === "true" || trimmed === "false") return trimmed;
				if (!isNaN(parseFloat(trimmed)) && isFinite(trimmed)) return trimmed;
				return escapeString(trimmed);
			});
			value = `[${items.join(",")}]`;
		} else {
			const arg = node.args[0] || "";
			const trimmed = arg.trim();
			if (trimmed === "null") value = "null";
			else if (trimmed === "true" || trimmed === "false") value = trimmed;
			else if (!isNaN(parseFloat(trimmed)) && isFinite(trimmed)) value = trimmed;
			else value = escapeString(trimmed);
		}
	}

	if (parentType === "object") {
		if (node.id === "none") return "";

		if (!node.value) {
			transpilerError([
				`{line}<$red:JSON Error:$> <$yellow:Inline elements inside an Object must have an identifier (key).$>{line}`
			]);
		}

		key = escapeString(node.value);
		return `${key}:${value}`;
	} else {
		return value;
	}
}

// ========================================================================== //
//  Main Registration                                                         //
// ========================================================================== //

const noop = () => "";
Json.register(["Object", "Array"], noop);
Json.register(["string", "number", "bool", "null", "array", "none"], noop);

Json.register("Json", ({ args, content, ast }) => {
	if (!ast) return "";
	return processNode(ast, null);
});

export default Json;
