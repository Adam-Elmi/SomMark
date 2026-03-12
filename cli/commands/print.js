import { cliError, formatMessage } from "../../core/errors.js";
import { isExist, readContent } from "../helpers/file.js";
import { transpile } from "../helpers/transpile.js";
import lexer from "../../core/lexer.js";
import parser from "../../core/parser.js";
import path from "node:path";

// ========================================================================== //
//  Print Output                                                              //
// ========================================================================== //
export async function printOutput(format, filePath) {
  if (await isExist(filePath)) {
    const fileName = path.basename(filePath);
    console.log(formatMessage(`{line}<$blue: Printing output for$> <$yellow:'${fileName}'$>{line}`));
    let source_code = await readContent(filePath);
    if (format === "json") {
      const output = await transpile({ src: source_code.toString(), format });
      console.log(JSON.stringify(JSON.parse(output, null, 2), null, 2));
    } else {
      console.log(await transpile({ src: source_code.toString(), format }));
    }
  } else {
    cliError([`{line}<$red:File$> <$blue:'${filePath}'$> <$red: is not found$>{line}`]);
  }
}

// ========================================================================== //
//  Print Lexer Tokens                                                        //
// ========================================================================== //
export async function printLex(filePath) {
  if (await isExist(filePath)) {
    const fileName = path.basename(filePath);
    console.log(formatMessage(`{line}<$blue: Printing tokens for$> <$yellow:'${fileName}'$>{line}`));
    const source_code = await readContent(filePath);
    const tokens = lexer(source_code.toString());
    console.log(JSON.stringify(tokens, null, 2));
  } else {
    cliError([`{line}<$red:File$> <$blue:'${filePath}'$> <$red: is not found$>{line}`]);
  }
}

// ========================================================================== //
//  Print Parser AST                                                          //
// ========================================================================== //
export async function printParse(filePath) {
  if (await isExist(filePath)) {
    const fileName = path.basename(filePath);
    console.log(formatMessage(`{line}<$blue: Printing AST for$> <$yellow:'${fileName}'$>{line}`));
    const source_code = await readContent(filePath);
    const ast = parser(lexer(source_code.toString()));
    console.log(JSON.stringify(ast, null, 2));
  } else {
    cliError([`{line}<$red:File$> <$blue:'${filePath}'$> <$red: is not found$>{line}`]);
  }
}
