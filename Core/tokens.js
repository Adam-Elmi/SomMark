// Token Types in SomMark
const TOKEN_TYPES = {
  OPEN_BRACKET: "OPEN_BRACKET",
  CLOSE_BRACKET: "CLOSE_BRACKET",
  END_BLOCK: "END_BLOCK",
  KEY: "KEY",
  EQUAL: "EQUAL",
  COLON: "COLON",
  VALUE: "VALUE",
  THIN_ARROW: "THIN_ARROW",
  OPEN_PAREN: "OPEN_PAREN",
  CLOSE_PAREN: "CLOSE_PAREN",
  OPEN_AT: "OPEN_AT",
  CLOSE_AT: "CLOSE_AT",
  TEXT_BLOCK: "TEXT_BLOCK",
};
// Token Values
const TOKEN_VALUES = {
  OPEN_BRACKET: /^\[\s*/,
  CLOSE_BRACKET: /\s*\]\s*\n/,
  END_BLOCK: /\n\s*\[\s*end\s*\]\s*/gi,
  KEY: /[a-zA-Z0-9]+\s*(?=\=)\s*/g,
  EQUAL: /\s*=\s*/,
  COLON: /\s*\:\s*/,
  VALUE: /(?<=\s*\=\s*)(\w+)[^\]]+/g,
  THIN_ARROW: "->",
  OPEN_PAREN: "(",
  CLOSE_PAREN: ")",
  OPEN_AT: "@_",
  CLOSE_AT: "_@",
  TEXT_BLOCK: /(?<=\]\n).+/gs,
};
export { TOKEN_TYPES, TOKEN_VALUES };
