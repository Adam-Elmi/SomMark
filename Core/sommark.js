import lexer from "./lexer.js";
import parser from "./parser.js";

class SomMark {
  constructor(src) {
    this.src = src;
  }
  lex() {
    return lexer(this.src);
  }
  parse() {
    const tokens = this.lex();
    return parser(tokens);
  }
}

export default SomMark;
