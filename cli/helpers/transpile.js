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
export async function transpile({ src, format, filename = null, mapperFile = "", config = null }) {
    const finalConfig = config || await loadConfig(filename);
    let finalMapper = mapperFile;

    // 1. Find the Mapping File
    if (typeof mapperFile !== "object" || mapperFile === null) {
        // Support both names from config
        const configMapper = finalConfig.mapperFile || finalConfig.mappingFile;
        
        if (configMapper) {
            finalMapper = configMapper;
        } else {
            finalMapper = default_mapperFiles[format];
        }

        // Custom Mapper (String Path)
        if (typeof finalMapper === "string" && finalMapper !== "") {
            const baseDir = finalConfig.resolvedConfigPath ? path.dirname(finalConfig.resolvedConfigPath) : process.cwd();
            const absoluteMapperPath = path.resolve(baseDir, finalMapper);
            
            if (await isExist(absoluteMapperPath)) {
                const mapperFileURL = `${pathToFileURL(absoluteMapperPath).href}?t=${Date.now()}`;
                const loadedMapper = await import(mapperFileURL);
                finalMapper = loadedMapper.default;
            }
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
