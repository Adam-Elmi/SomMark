import colorize from "./colorize.js";

class ParserError extends Error {
	constructor(message, line, start, end, token = "Unknown") {
		super(message);
    this.name = "ParserError";
    this.message = `${colorize("cyan", this.name)}:\n-------------------------------------------------------\n${colorize("red", message)} at line ${colorize("yellow", line)}, from column ${colorize("yellow", start)} to ${colorize("yellow", end)}\n-------------------------------------------------------\n${colorize("blue", "Token we got")}: ${colorize("magenta", token === "\n" ? "\\n" : "'" +token + "'")} at line ${colorize("yellow", line)}, from column ${colorize("yellow", start)} to ${colorize("yellow", end)}\n-------------------------------------------------------\n
		`;
		this.line = line;
		this.start = start;
		this.end = end;
		this.token = token;
	}
}

export { ParserError };
