// ###################
// --lex / --parse: print tokens or the AST
// ###################

import { readFile } from "node:fs/promises";
import lexer from "../../core/lexer.js";
import parser from "../../core/parser.js";
import { isExist } from "../helpers/file.js";
import { cliError } from "../helpers/errors.js";

const load = async (file) => {
	if (!file) cliError("missing file");
	if (!(await isExist(file))) cliError(`"${file}" is not found`);
	return readFile(file, "utf8");
};

export async function printLex(file) {
	try {
		console.log(JSON.stringify(lexer(await load(file), file), null, 2));
	} catch (err) {
		cliError(err.message);
	}
}

export async function printParse(file) {
	try {
		console.log(JSON.stringify(parser(lexer(await load(file), file)), null, 2));
	} catch (err) {
		cliError(err.message);
	}
}
