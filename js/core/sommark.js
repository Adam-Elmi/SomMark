import lexer from "./lexer.js";
import parser from "./parser.js";
import transpiler from "./transpiler.js";


class SomMark {
  constructor(src, format, targetFile) {
    this.src = src;
    this.format = format;
    this.targetFile = targetFile;
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
    return transpiler(ast, this.format, this.targetFile);
  }
}

export default SomMark;
