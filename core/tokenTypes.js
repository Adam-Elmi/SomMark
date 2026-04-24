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
 * @property {string} VALUE - Data values. Encapsulates Quoted Strings ("...") and Prefix Layers (js{}, p{}).
 * @property {string} TEXT - Plain unformatted text content.
 * @property {string} THIN_ARROW - '->' sequence.
 * @property {string} OPEN_PAREN - '(' char.
 * @property {string} CLOSE_PAREN - ')' char.
 * @property {string} OPEN_AT - '@_' sequence (At-Block start).
 * @property {string} CLOSE_AT - '_@' sequence (At-Header end).
 * @property {string} COLON - ':' char.
 * @property {string} COMMA - ',' char.
 * @property {string} SEMICOLON - ';' char (At-Block separator).
 * @property {string} COMMENT - '#' comments.
 * @property {string} ESCAPE - '\' char. Used for literalizing structural chars like '\"' or '\['.
 * @property {string} QUOTE - '"' delimiter.
 * @property {string} IMPORT - 'import' keyword.
 * @property {string} USE_MODULE - '$use-module' keyword.
 * @property {string} PREFIX_JS - 'js{}' prefix layer.
 * @property {string} PREFIX_P - 'p{}' placeholder layer.
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
  PREFIX_JS: "PREFIX_JS",
  PREFIX_P: "PREFIX_P",
  TEXT: "TEXT",
  THIN_ARROW: "THIN_ARROW",
  OPEN_PAREN: "OPEN_PAREN",
  CLOSE_PAREN: "CLOSE_PAREN",
  OPEN_AT: "OPEN_AT",
  CLOSE_AT: "CLOSE_AT",
  COLON: "COLON",
  COMMA: "COMMA",
  SEMICOLON: "SEMICOLON",
  COMMENT: "COMMENT",
  ESCAPE: "ESCAPE",
  KEY: "KEY",
  WHITESPACE: "WHITESPACE",
  EOF: "EOF"
};

export default TOKEN_TYPES;
