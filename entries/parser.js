import lexer from "../core/lexer.js";
import parser from "../core/parser.js";
import TOKEN_TYPES from "../core/tokenTypes.js";
import * as labels from "../core/labels.js";
import { runtimeError } from "../core/errors.js";

export { TOKEN_TYPES, labels };

export const lexSync = (src, filename = "anonymous") => {
    if (src === undefined || src === null) {
        runtimeError([`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for tokenization.$>{line}`]);
    }
    if (typeof src !== "string") {
        runtimeError([`{line}<$red:Invalid Source Type:$> <$yellow:The 'src' argument must be a string, received ${typeof src}.$>{line}`]);
    }
    return lexer(src, filename);
};

export const lex = async (src, filename = "anonymous") => lexSync(src, filename);

export const parseSync = (src, filename = "anonymous") => {
    if (src === undefined || src === null) {
        runtimeError([`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for parsing.$>{line}`]);
    }
    if (typeof src !== "string") {
        runtimeError([`{line}<$red:Invalid Source Type:$> <$yellow:The 'src' argument must be a string, received ${typeof src}.$>{line}`]);
    }
    const tokens = lexer(src, filename);
    return parser(tokens, filename);
};

export const parse = async (src, filename = "anonymous") => parseSync(src, filename);
