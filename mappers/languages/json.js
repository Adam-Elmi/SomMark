import Mapper from "../mapper.js";

const Json = new Mapper();

// ========================================================================== //
//  Type Checking                                                             //
// ========================================================================== //
const isNumber = value => typeof value === "string" && value.split("").every(ch => Number.isInteger(Number(ch)));
const isBoolean = value => value === "true" || value === "false";
// Object or Array
const isTable = (key, expected_type, fallback = null) =>
	(key && key === expected_type) || (fallback && fallback === expected_type) || false;

function getType(value) {
	let type = "string";
	if (value) {
		isNumber(value) ? (type = "number") : isBoolean(value) ? (type = "boolean") : null;
	}
	return type;
}

// ========================================================================== //
//  Main Block                                                                //
// ========================================================================== //
Json.register("Json", ({ args, content, ast }) => {
  console.log(ast);
	return content;
});

// ========================================================================== //
//  Primitive Data                                                            //
// ========================================================================== //

// function handle_primitive_data(key, value, depth) {
// 	let output = "";
// 	if (parent_depth === depth) {
// 		if (parent_type === parent_array) {
// 			output = `{${key}:${value}}`;
// 		} else if (parent_type === parent_object) {
// 			output = `${key}:${value}`;
// 		}
// 	} else if (child_depth === depth) {
// 		if (child_type === child_array) {
// 			output = `{${key}:${value}}`;
// 		} else if (child_type === child_object) {
// 			output = `${key}:${value}`;
// 		}
// 	}
// 	return output;
// }

// // ========================================================================== //
// //  String                                                                    //
// // ========================================================================== //
// Json.register("string", ({ args, content, depth }) => {
// 	const key = JSON.stringify(content);
// 	const value = JSON.stringify(args[0]);
// 	return handle_primitive_data(key, value, depth);
// });
// // ========================================================================== //
// //  Number                                                                    //
// // ========================================================================== //
// Json.register("number", ({ args, content, depth }) => {
// 	const key = JSON.stringify(content);
// 	const value = JSON.stringify(args[0]);
// 	return handle_primitive_data(key, value, depth);
// });
// // ========================================================================== //
// //  Boolean                                                                   //
// // ========================================================================== //
// Json.register("bool", ({ args, content, depth }) => {
// 	const key = JSON.stringify(content);
// 	const value = JSON.stringify(args[0]);
// 	return handle_primitive_data(key, value, depth);
// });
// // ========================================================================== //
// //  Null                                                                      //
// // ========================================================================== //
// Json.register("null", ({ args, content, depth }) => {
// 	const key = JSON.stringify(content);
// 	return handle_primitive_data(key, null, depth);
// });

export default Json;
