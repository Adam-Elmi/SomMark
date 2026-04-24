import path from "node:path";
import { pathToFileURL } from "node:url";
import { cliError } from "../../core/errors.js";
import SomMark from "../../index.js";
import HTML from "../../mappers/languages/html.js";
import MARKDOWN from "../../mappers/languages/markdown.js";
import MDX from "../../mappers/languages/mdx.js";
import Json from "../../mappers/languages/json.js";
import { isExist } from "./file.js";
import { loadConfig } from "./config.js";
import { htmlFormat, markdownFormat, mdxFormat, jsonFormat, textFormat } from "../../core/formats.js";

const default_mapperFiles = { [htmlFormat]: HTML, [markdownFormat]: MARKDOWN, [mdxFormat]: MDX, [jsonFormat]: Json, [textFormat]: null };

// ========================================================================== //
//  Transpile Function                                                        //
// ========================================================================== //
export async function transpile({ src, format, filename = null, mappingFile = "", config = null }) {
    const finalConfig = config || await loadConfig(filename);
    let finalMapper = mappingFile;

    // 1. Find the Mapping File
    if (typeof mappingFile !== "object" || mappingFile === null) {
        if (finalConfig.mappingFile) {
            finalMapper = finalConfig.mappingFile;
        } else {
            finalMapper = default_mapperFiles[format];
        }

        // Custom Mapper (String Path)
        if (typeof finalMapper === "string" && finalMapper !== "" && (await isExist(finalMapper))) {
            const mappingFileURL = pathToFileURL(path.resolve(process.cwd(), finalMapper)).href;
            const loadedMapper = await import(mappingFileURL);
            finalMapper = loadedMapper.default;
        }
    }

    // 2. Run SomMark Process
    const smark = new SomMark({
        ...finalConfig,
        src,
        format,
        filename,
        mapperFile: finalMapper,
    });

    return await smark.transpile();
}
