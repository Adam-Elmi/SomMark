import { cliError, formatMessage } from "../../core/errors.js";
import { isExist, readContent } from "../helpers/file.js";
import { transpile } from "../helpers/transpile.js";
import SomMark from "../../index.js";
import { loadConfig } from "../helpers/config.js";
import path from "node:path";

// ========================================================================== //
//  Print Output                                                              //
// ========================================================================== //
/**
 * Creates the code and prints it to the console.
 * @param {string} format - The final file format ('html', 'markdown', etc.).
 * @param {string} filePath - Path to the source .smark file.
 */
export async function printOutput(format, filePath) {
  if (await isExist(filePath)) {
    const fileName = path.basename(filePath);
    console.log(formatMessage(`{line}<$blue: Printing output for$> <$yellow:'${fileName}'$>{line}`));
    let source_code = await readContent(filePath);
    const config = await loadConfig(filePath);
    const absolutePath = path.resolve(process.cwd(), filePath);
    if (format === "json") {
      const output = await transpile({ src: source_code.toString(), format, filename: absolutePath, config });
      console.log(JSON.stringify(JSON.parse(output, null, 2), null, 2));
    } else {
      console.log(await transpile({ src: source_code.toString(), format, filename: absolutePath, config }));
    }
  } else {
    cliError([`{line}<$red:File$> <$blue:'${filePath}'$> <$red: is not found$>{line}`]);
  }
}

/**
 * Prints the raw tokens of the file to the console as JSON.
 * @param {string} filePath - Path to the source .smark file.
 */
export async function printLex(filePath) {
  if (await isExist(filePath)) {
    const fileName = path.basename(filePath);
    console.log(formatMessage(`{line}<$blue: Printing tokens for$> <$yellow:'${fileName}'$>{line}`));
    const source_code = await readContent(filePath);
    const config = await loadConfig(filePath);

    const absolutePath = path.resolve(process.cwd(), filePath);
    const smark = new SomMark({
      ...config,
      src: source_code.toString(),
      format: "text",
      filename: absolutePath,
    });


    const tokens = await smark.lex();
    console.log(JSON.stringify(tokens, null, 2));
  } else {
    cliError([`{line}<$red:File$> <$blue:'${filePath}'$> <$red: is not found$>{line}`]);
  }
}

/**
 * Prints the code tree of the file to the console as JSON.
 * @param {string} filePath - Path to the source .smark file.
 */
export async function printParse(filePath) {
  if (await isExist(filePath)) {
    const fileName = path.basename(filePath);
    console.log(formatMessage(`{line}<$blue: Printing AST for$> <$yellow:'${fileName}'$>{line}`));
    const source_code = await readContent(filePath);
    const config = await loadConfig(filePath);

    const absolutePath = path.resolve(process.cwd(), filePath);
    const smark = new SomMark({
      ...config,
      src: source_code.toString(),
      format: "text",
      filename: absolutePath,
    });


    const ast = await smark.parse();
    console.log(JSON.stringify(ast, null, 2));
  } else {
    cliError([`{line}<$red:File$> <$blue:'${filePath}'$> <$red: is not found$>{line}`]);
  }
}
