import { cliError, formatMessage } from "../../core/errors.js";
import { isExist, readContent } from "../helpers/file.js";
import { transpile } from "../helpers/transpile.js";
import path from "node:path";

// ========================================================================== //
//  Print Output                                                              //
// ========================================================================== //
export async function printOutput(format, filePath) {
    if (await isExist(filePath)) {
        const fileName = path.basename(filePath);
        console.log(formatMessage(`{line}[<$yellow: STATUS$> : <$green: SUCCESS$>]{line}<$blue: Printing output for$> <$yellow:'${fileName}'$>{line}`));
        let source_code = await readContent(filePath);
        console.log(await transpile({ src: source_code.toString(), format }));
    } else {
        cliError([`{line}<$red:File$> <$blue:'${filePath}'$> <$red: is not found$>{line}`]);
    }
}
