import lexer from "./lexer.js";

class SomMark {
  constructor() {}
  lex(src) {
    return lexer(src);
  }
}

export default SomMark;
