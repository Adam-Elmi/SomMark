// ###################
// ArcMoon lexer: turns .arcm source into tokens
// ###################

export const TOKEN_TYPES = Object.freeze({
	OPEN_BRACKET: "OPEN_BRACKET",
	CLOSE_BRACKET: "CLOSE_BRACKET",
	IDENTIFIER: "IDENTIFIER",
	END_KEYWORD: "END_KEYWORD",
	IMPORT: "IMPORT",
	SLOT: "SLOT",
	FOR_EACH: "FOR_EACH",
	EQUAL: "EQUAL",
	COLON: "COLON",
	COMMA: "COMMA",
	EXCLAMATION_MARK: "EXCLAMATION_MARK",
	KEY: "KEY",
	STRING: "STRING",
	NUMBER: "NUMBER",
	BOOLEAN: "BOOLEAN",
	WORD: "WORD",
	TEXT: "TEXT",
	ESCAPE: "ESCAPE",
	WHITESPACE: "WHITESPACE",
	COMMENT: "COMMENT",
	COMMENT_BLOCK: "COMMENT_BLOCK",
	RUNTIME_KEYWORD: "RUNTIME_KEYWORD",
	LOGIC_OPEN: "LOGIC_OPEN",
	LOGIC: "LOGIC",
	LOGIC_CLOSE: "LOGIC_CLOSE",
	EOF: "EOF"
});

const T = TOKEN_TYPES;

// ###################
// Block names with special meaning
// ###################
const BLOCK_KEYWORDS = {
	import: T.IMPORT,
	slot: T.SLOT,
	"for-each": T.FOR_EACH
};

const ID_START = /[A-Za-z0-9_$]/;
const NUMBER_RE = /^-?\d+(\.\d+)?$/;
const RUNTIME_RE = /runtime[ \t]*\$\{/y;
const NAME_STOP = "[]=,\"'#\\ \t\n\r!";
const VALUE_STOP = "[]:=,\"'#\\ \t\n\r!";

export class LexerError extends Error {
	constructor(message, source, line, character) {
		super(`${source}:${line + 1}:${character + 1}  ${message}`);
		this.name = "LexerError";
		this.source = source;
		this.position = { line, character };
	}
}

export default function lexer(src, filename = "anonymous") {
	if (typeof src !== "string") throw new TypeError("lexer: src must be a string");

	const tokens = [];
	let i = 0;
	let line = 0;
	let character = 0;

	let inHeader = false;
	let atBlockName = false;
	let rawKey = false;
	let rawOn = false;
	let selfClosing = false;

	const fail = (message) => {
		throw new LexerError(message, filename, line, character);
	};

	// ###################
	// Push a token and move the position
	// ###################
	const add = (type, value, raw = value) => {
		const start = { line, character };
		const parts = raw.split("\n");
		if (parts.length > 1) {
			line += parts.length - 1;
			character = parts[parts.length - 1].length;
		} else {
			character += raw.length;
		}
		tokens.push({ type, value, source: filename, range: { start, end: { line, character } } });
		i += raw.length;
	};

	const isSpace = (c) => c === " " || c === "\t" || c === "\r";

	const runtimeAt = (j) => {
		const afterLogic = src[j - 1] === "$" && src[j - 2] === "}";
		if (j > 0 && /[\w$]/.test(src[j - 1]) && !afterLogic) return false;
		RUNTIME_RE.lastIndex = j;
		return RUNTIME_RE.test(src);
	};

	// ###################
	// [ opens a block only before a valid name
	// ###################
	const opensBlock = (j) => {
		const n = src[j + 1];
		if (n === undefined || !ID_START.test(n)) return false;
		return !(n === "$" && src[j + 2] === "{");
	};

	// ###################
	// Next real char, skipping spaces and comments
	// ###################
	const nextStructural = (j) => {
		while (j < src.length) {
			const c = src[j];
			if (c === " " || c === "\t" || c === "\n" || c === "\r") {
				j++;
			} else if (c === "#") {
				while (j < src.length && src[j] !== "\n") j++;
			} else {
				return c;
			}
		}
		return null;
	};

	const readWhile = (stop) => {
		let j = i;
		while (j < src.length && !stop.includes(src[j]) && !(src[j] === "$" && src[j + 1] === "{")) j++;
		return src.slice(i, j);
	};

	const markRaw = (value) => {
		if (rawKey) rawOn = value === "true" || value === true;
		rawKey = false;
	};

	// ###################
	// # line comment or ### block comment ###
	// ###################
	const readComment = () => {
		if (src.startsWith("###", i)) {
			const end = src.indexOf("###", i + 3);
			if (end === -1) fail("comment block is not closed with ###");
			const raw = src.slice(i, end + 3);
			add(T.COMMENT_BLOCK, raw.slice(3, -3), raw);
			return;
		}
		let end = src.indexOf("\n", i);
		if (end === -1) end = src.length;
		const raw = src.slice(i, end);
		add(T.COMMENT, raw.slice(1), raw);
	};

	const readEscape = () => {
		const n = src[i + 1];
		if (n === undefined || /\s/.test(n)) fail("\\ must be followed by a character");
		add(T.ESCAPE, n, "\\" + n);
	};

	// ###################
	// ${ ... }$ with JS strings and comments skipped
	// ###################
	const readLogic = () => {
		let j = i + 2;
		let depth = 0;
		let str = null;
		let closed = false;

		while (j < src.length) {
			const c = src[j];
			const n = src[j + 1];

			if (str) {
				if (c === "\\") {
					j += 2;
					continue;
				}
				if (c === str) str = null;
				j++;
				continue;
			}

			if (c === "}" && n === "$" && depth === 0 && src[j + 2] !== "{") {
				closed = true;
				break;
			}
			if (c === "/" && n === "/") {
				while (j < src.length && src[j] !== "\n") j++;
				continue;
			}
			if (c === "/" && n === "*") {
				const end = src.indexOf("*/", j + 2);
				j = end === -1 ? src.length : end + 2;
				continue;
			}
			if (c === "\"" || c === "'" || c === "`") str = c;
			else if (c === "{") depth++;
			else if (c === "}") depth--;
			j++;
		}

		if (!closed) fail("logic block is not closed with }$");
		add(T.LOGIC_OPEN, "${");
		add(T.LOGIC, src.slice(i, j));
		add(T.LOGIC_CLOSE, "}$");
	};

	// ###################
	// Quoted value or key: "..." or '...'
	// ###################
	const readString = () => {
		const quote = src[i];
		let j = i + 1;
		let value = "";

		while (true) {
			if (j >= src.length) fail(`string is not closed with ${quote}`);
			const c = src[j];
			if (c === "\\" && (src[j + 1] === quote || src[j + 1] === "\\")) {
				value += src[j + 1];
				j += 2;
				continue;
			}
			if (c === quote) break;
			value += c;
			j++;
		}

		const raw = src.slice(i, j + 1);
		if (nextStructural(j + 1) === ":") {
			add(T.KEY, value, raw);
			rawKey = value === "arcm-raw";
		} else {
			add(T.STRING, value, raw);
			markRaw(value);
		}
	};

	// ###################
	// Body of an arcm-raw block, kept as-is until [end]
	// ###################
	const readRaw = () => {
		let j = i;
		let value = "";
		while (j < src.length) {
			if (src[j] === "\\" && src[j + 1] === "[") {
				value += "[";
				j += 2;
				continue;
			}
			if (src.startsWith("[end]", j) || src.startsWith("[end:", j)) break;
			value += src[j];
			j++;
		}
		if (j > i) add(T.TEXT, value, src.slice(i, j));
	};

	const openBlock = () => {
		add(T.OPEN_BRACKET, "[");
		inHeader = true;
		atBlockName = true;
		rawKey = false;
		rawOn = false;
		selfClosing = false;
	};

	const closeBlock = () => {
		add(T.CLOSE_BRACKET, "]");
		inHeader = false;
		atBlockName = false;
		if (rawOn && !selfClosing) readRaw();
		rawOn = false;
	};

	// ###################
	// Everything between [ and ]
	// ###################
	const readHeader = (c) => {
		if (c === "]") return closeBlock();
		if (c === "[") fail("unexpected [ inside a block header");
		if (c === "!") {
			selfClosing = true;
			return add(T.EXCLAMATION_MARK, "!");
		}
		if (c === "=") return add(T.EQUAL, "=");
		if (c === ":") return add(T.COLON, ":");
		if (c === ",") return add(T.COMMA, ",");
		if (c === "\"" || c === "'") return readString();

		if (atBlockName) {
			atBlockName = false;
			const name = readWhile(NAME_STOP);
			if (name === "end" || name.startsWith("end:")) return add(T.END_KEYWORD, name);
			return add(BLOCK_KEYWORDS[name] ?? T.IDENTIFIER, name);
		}

		const word = readWhile(VALUE_STOP);
		if (!word) fail(`unexpected character ${c}`);

		if (nextStructural(i + word.length) === ":") {
			add(T.KEY, word);
			rawKey = word === "arcm-raw";
		} else if (word === "true" || word === "false") {
			add(T.BOOLEAN, word);
			markRaw(word);
		} else if (NUMBER_RE.test(word)) {
			add(T.NUMBER, word);
			markRaw(word);
		} else {
			add(T.WORD, word);
			markRaw(word);
		}
	};

	// ###################
	// Plain text between blocks
	// ###################
	const readText = () => {
		let j = i;
		while (j < src.length) {
			const c = src[j];
			if (c === "\n" || c === "\\" || c === "#") break;
			if (c === "$" && src[j + 1] === "{") break;
			if (c === "[" && opensBlock(j)) break;
			if (c === "r" && runtimeAt(j)) break;
			j++;
		}
		add(T.TEXT, src.slice(i, j));
	};

	while (i < src.length) {
		const c = src[i];

		if (c === "\n") {
			add(T.WHITESPACE, "\n");
		} else if (isSpace(c)) {
			let j = i;
			while (j < src.length && isSpace(src[j])) j++;
			add(T.WHITESPACE, src.slice(i, j));
		} else if (c === "#") {
			readComment();
		} else if (c === "\\") {
			readEscape();
		} else if (c === "$" && src[i + 1] === "{") {
			readLogic();
		} else if (c === "r" && runtimeAt(i)) {
			add(T.RUNTIME_KEYWORD, "runtime");
		} else if (inHeader) {
			readHeader(c);
		} else if (c === "[" && opensBlock(i)) {
			openBlock();
		} else {
			readText();
		}
	}

	add(T.EOF, "");
	return tokens;
}
