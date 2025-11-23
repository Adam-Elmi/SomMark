const red = "\x1b[31m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const blue = "\x1b[34m";
const magenta = "\x1b[35m";
const cyan = "\x1b[36m";
const reset = "\x1b[0m";

class ParserError extends Error {
  constructor(message, line, columnStart, columnEnd) {
    super(message);
    this.message = `${red}${message}${reset} at line ${yellow}${line}${reset}, from column ${yellow}${columnStart}${reset} to ${yellow}${columnEnd}${reset}`;
    this.line = line;
    this.columnStart = columnStart;
    this.columnEnd = columnEnd;
    this.name = "\x1b[31mAdam"
    this.stack = '  Hello'
  }
}

export { ParserError };
