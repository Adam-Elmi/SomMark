/**
 * Token Types in SomMark.
 * These represent the basic lexical atoms identified by the lexer.
 * 
 * @constant {Object}
 * @property {string} OPEN_BRACKET - '[' char.
 * @property {string} CLOSE_BRACKET - ']' char.
 * @property {string} END_KEYWORD - 'end' value.
 * @property {string} IDENTIFIER - Block or inline name (e.g. 'Person', 'import', '$use-module').
 * @property {string} EQUAL - '=' char.
 * @property {string} VALUE - Data values. Encapsulates Quoted Strings ("...") and Prefix Layers (p{}, v{}).
 * @property {string} TEXT - Plain unformatted text content.
 * @property {string} COLON - ':' char.
 * @property {string} COMMA - ',' char.
 * @property {string} COMMENT - '#' comments.
 * @property {string} COMMENT_BLOCK - '###' comments.
 * @property {string} ESCAPE - '\' char. Used for literalizing structural chars like '\"' or '\['.
 * @property {string} QUOTE - '"' delimiter.
 * @property {string} EXCLAMATION_MARK - '!' char.
 * @property {string} IMPORT - 'import' keyword.
 * @property {string} USE_MODULE - '$use-module' keyword.
 * @property {string} PREFIX_P - 'p{}' placeholder layer.
 * @property {string} PREFIX_V - 'v{}' local variable layer.
 * @property {string} EOF - End of File indicator.
 */
const TOKEN_TYPES = {
  OPEN_BRACKET: "OPEN_BRACKET",
  CLOSE_BRACKET: "CLOSE_BRACKET",
  END_KEYWORD: "END_KEYWORD",
  IMPORT: "IMPORT",
  USE_MODULE: "USE_MODULE",
  IDENTIFIER: "IDENTIFIER",
  EQUAL: "EQUAL",
  VALUE: "VALUE",
  QUOTE: "QUOTE",
  PREFIX_P: "PREFIX_P",
  PREFIX_V: "PREFIX_V",
  TEXT: "TEXT",
  COLON: "COLON",
  COMMA: "COMMA",
  COMMENT: "COMMENT",
  COMMENT_BLOCK: "COMMENT_BLOCK",
  ESCAPE: "ESCAPE",
  EXCLAMATION_MARK: "EXCLAMATION_MARK",
  SLOT_KEYWORD: "SLOT_KEYWORD",
  KEY: "KEY",
  WHITESPACE: "WHITESPACE",
  STATIC_KEYWORD: "STATIC_KEYWORD",
  RUNTIME_KEYWORD: "RUNTIME_KEYWORD",
  LOGIC_OPEN: "LOGIC_OPEN",
  LOGIC: "LOGIC",
  LOGIC_CLOSE: "LOGIC_CLOSE",
  FOR_EACH: "FOR_EACH",
  PREFIX_OPEN: "PREFIX_OPEN",
  PREFIX_CLOSE: "PREFIX_CLOSE",
  PIPELINE: "PIPELINE",
  EOF: "EOF"
};

export default TOKEN_TYPES;
