import Mapper from "../mapper.js";

const Json = new Mapper();

const _types_ = {
	outer_object: "object",
	outer_array: "array",
	inner_object: "Object",
	inner_array: "Array"
};

const { outer_object, outer_array, inner_object, inner_array } = _types_;

let level = "";

const isNumber = value => typeof value === "string" && value.split("").every(ch => Number.isInteger(Number(ch)));
const isBoolean = value => value === "true" || value === "false";
// Object or Array
const isTable = (key, fallback, expected_type) => (key && key === expected_type) || (fallback && fallback === expected_type);

function getType(value) {
	let type = "string";
	if (value) {
		isNumber(value) ? (type = "number") : isBoolean(value) ? (type = "boolean") : null;
	}
	return type;
}

Json.register("Json", ({ args, content }) => {
	const block_type = args && args[0] ? args[0] : null;
	block_type ? (level = block_type) : null;
	if (block_type) {
		block_type === outer_object ? (content = `{${content}}`) : block_type === outer_array ? (content = `[${content}]`) : null;
	}
	return content;
});

Json.register("array", ({ args, content }) => {
	if (level && Array.isArray(args) && args.length > 0) {
		args = args.map(value => {
			switch (true) {
				case isNumber(value):
					value = Number(value);
					break;
				case isBoolean(value):
					value = Boolean(value);
					break;
				case value === "null":
					value = null;
					break;
			}
			return value;
		});
		level === "array"
			? (content = `{${JSON.stringify(content)}:${JSON.stringify(args)}}`)
			: level === "object"
				? (content = `${JSON.stringify(content)}:${JSON.stringify(args)}`)
				: level === "Object"
					? (content = `{${JSON.stringify(content)}:${JSON.stringify(args)}}`)
					: level === "Array"
						? (content = `${JSON.stringify(content)}:${JSON.stringify(args)}`)
						: null;
	}
	return content;
});

Json.register("Object", ({ args, content }) => {
	const key = args && args[0] ? JSON.stringify(args[0]) : "";
	if (level) {
		switch (level) {
			case outer_object:
				content = `${key}:{${content}}`;
				break;
			case outer_array:
				content = `{${key}:${content}}`;
				break;
		}
	}
	level = inner_object;
	content = JSON.stringify(content);
	return JSON.parse(content);
});

Json.register("Array", ({ args, content }) => {
	const key = args && args[0] ? JSON.stringify(args[0]) : "";
	if (level) {
		switch (level) {
			case outer_object:
				content = `${key}:[${content}]`;
				break;
			case outer_array:
				content = `[{${key}:${content}}]`;
				break;
		}
	}
	level = outer_array;
	content = JSON.stringify(content);
	return JSON.parse(content);
});

Json.register("string", ({ args, content }) => {
	const key = JSON.stringify(content);
	const value = JSON.stringify(args[0]);
	let output = `${key}:${value}`;
	output = JSON.stringify(output);
	return JSON.parse(output);
});

Json.register("number", ({ args, content }) => {
	const key = JSON.stringify(content);
	const value = JSON.stringify(args[0]);
	let output = `${key}:${JSON.parse(value)}`;
	output = JSON.stringify(output);
	return JSON.parse(output);
});

Json.register("bool", ({ args, content }) => {
	const key = JSON.stringify(content);
	const value = JSON.stringify(args[0]);
	let output = `${key}:${Boolean(value)}`;
	output = JSON.stringify(output);
	return JSON.parse(output);
});

export default Json;
