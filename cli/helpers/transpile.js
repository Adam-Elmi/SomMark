import path from "node:path";
import { pathToFileURL } from "node:url";
import { cliError } from "../../core/errors.js";
import lexer from "../../core/lexer.js";
import parser from "../../core/parser.js";
import transpiler from "../../core/transpiler.js";
import HTML from "../../mappers/languages/html.js";
import MARKDOWN from "../../mappers/languages/markdown.js";
import MDX from "../../mappers/languages/mdx.js";
import { isExist } from "./file.js";
import { loadConfig } from "./config.js";

// ========================================================================== //
//  Transpile Function                                                        //
// ========================================================================== //
export async function transpile({ src, format, mappingFile = "" }) {
    if (typeof mappingFile === "object" && mappingFile !== null) {
        return await transpiler({ ast: parser(lexer(src)), format, mapperFile: mappingFile });
    }

    const config = await loadConfig();

    // Use config mapping file if not provided as argument
    if (!mappingFile && config.mappingFile) {
        mappingFile = config.mappingFile;
    }

    if (config.mode === "default") {
        return await transpiler({
            ast: parser(lexer(src)),
            format,
            mapperFile: format === "html" ? HTML : format === "markdown" ? MARKDOWN : MDX
        });
    }

    // Check if mappingFile is an object (loaded from config)
    if (typeof mappingFile === "object" && mappingFile !== null) {
        return await transpiler({ ast: parser(lexer(src)), format, mapperFile: mappingFile });
    }

    // ========================================================================== //
    //  Custom Mapper (String Path)                                               //
    // ========================================================================== //
    else if (typeof mappingFile === "string" && (await isExist(mappingFile))) {
        const mappingFileURL = pathToFileURL(path.resolve(process.cwd(), mappingFile)).href;
        const loadedMapper = await import(mappingFileURL);
        return await transpiler({ ast: parser(lexer(src)), format, mapperFile: loadedMapper.default });
    }
    // ========================================================================== //
    //  Error: Mapper not found                                                   //
    // ========================================================================== //
    else {
        cliError([`{line}<$red:File$> <$blue:'${mappingFile}'$> <$red: is not found$>{line}`]);
    }
}
