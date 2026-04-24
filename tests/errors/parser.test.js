import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import lexer from "../../core/lexer.js";
import parser from "../../core/parser.js";

// Utility to recursively find all .smark files
const getSmarkFiles = (dir) => {
	let results = [];
	const list = fs.readdirSync(dir);
	list.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		if (stat && stat.isDirectory()) {
			results = results.concat(getSmarkFiles(filePath));
		} else if (file.endsWith(".smark")) {
			results.push(filePath);
		}
	});
	return results;
};

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const errorsDir = path.resolve(__dirname, "./parser-errors");
const files = getSmarkFiles(errorsDir);

describe("SomMark Parser: Categorized Error Sensitivity", () => {
	files.forEach((filePath) => {
		const relativePath = path.relative(errorsDir, filePath);
		it(`should correctly catch and throw error for: ${relativePath}`, () => {
			const src = fs.readFileSync(filePath, "utf8");
			
			// We expect the parser to throw a LexerError or ParserError (string message)
			expect(() => {
				const tokens = lexer(src);
				parser(tokens, relativePath);
			}).toThrow();
		});
	});
});
