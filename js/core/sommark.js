import lexer from "./lexer.js";
import parser from "./parser.js";
import transpiler from "./transpiler.js";
import html from "../mapping/default_mode/smark.html.js";

class SomMark {
  constructor(src, format) {
    this.src = src;
    this.format = format;
  }
  lex() {
    return lexer(this.src);
  }
  parse() {
    const tokens = this.lex();
    return parser(tokens);
  }
  transpile() {
    const ast = this.parse();
    return transpiler(ast, this.format, html);
  }
}

export default SomMark;
