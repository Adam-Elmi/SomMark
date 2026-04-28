import fs from "node:fs/promises"; // Add fs import for stat
import path from "node:path";
import { cliError, formatMessage } from "../../core/errors.js";
import HTML from "../../mappers/languages/html.js";
import MARKDOWN from "../../mappers/languages/markdown.js";
import MDX from "../../mappers/languages/mdx.js";
import Json from "../../mappers/languages/json.js";
import XML from "../../mappers/languages/xml.js";
import { extensions } from "../constants.js";
import { isExist, readContent, createFile } from "../helpers/file.js";
import { loadConfig } from "../helpers/config.js";
import { transpile } from "../helpers/transpile.js";

// ========================================================================== //
//  Generate Output File                                                      //
// ========================================================================== //
/**
 * Helper to generate and save the created code.
 * @param {string} outputDir - Directory to save the file.
 * @param {string} outputFile - Output filename (without extension).
 * @param {string} format - Target format (html, markdown, etc.).
 * @param {string} sourcePath - Path to the source .smark file.
 * @param {Mapper|null} mapperFile - Custom mapped rules.
 * @returns {Promise<string>} - The full path to the created file.
 */
async function generateOutput(outputDir, outputFile, format, sourcePath, mapperFile, config) {
    let source_code = await readContent(sourcePath);
    source_code = source_code.toString();
    const absolutePath = path.resolve(process.cwd(), sourcePath);
    const output = await transpile({ src: source_code, format, filename: absolutePath, mapperFile, config });
    const finalPath = path.join(outputDir, `${outputFile}.${extensions[format]}`);
    await createFile(outputDir, `${outputFile}.${extensions[format]}`, output);
    return finalPath;
}

// ========================================================================== //
//  Run Build Process                                                         //
// ========================================================================== //
/**
 * The starting point for the build process.
 * Checks the file type, loads settings, and creates the output code.
 * 
 * @param {string} format_option - The file format to output (like '--html').
 * @param {string} sourcePath - The path to the file you want to build.
 * @param {string} outputFlag - The '-o' flag.
 * @param {string} outputFileArg - The custom filename.
 * @param {string} outputDirArg - The custom directory.
 */
export async function runBuild(format_option, sourcePath, outputFlag, outputFileArg, outputDirArg) {
    try {
        const format = format_option.replaceAll("-", "") ?? "";

        // Validate Format
        if (!extensions[format]) {
            return;
        }

        const targetFile = sourcePath ? path.parse(sourcePath) : "";
        if (await isExist(sourcePath)) {
            const file = path.parse(sourcePath);
            if (file.ext === ".smark") {
                const config = await loadConfig(sourcePath);

                const success_msg = (outputDir, outputFile, size, date) => {
                    return formatMessage(
                        [
                            `{line}[<$yellow: STATUS$> : <$green: SUCCESS$>]{line}<$blue: File$> <$yellow:'${outputFile}.${extensions[format]}'$> <$blue: is successfully created`,
                            ` in directory$> <$yellow: '${outputDir}'$>{N}`,
                            `<$blue:Size: $> <$yellow:${size} bytes$>{N}`,
                            `<$blue:Date: $> <$yellow:${date}$>{line}`
                        ].join("")
                    );
                };

                // Configuration for output
                let finalOutputFile = config.outputFile;
                let finalOutputDir = config.outputDir;
                let mapperFile = config.mapperFile || config.mappingFile;

                if (!mapperFile) {
                    mapperFile = format === "html" ? HTML : format === "markdown" ? MARKDOWN : format === "mdx" ? MDX : format === "json" ? Json : format === "xml" ? XML : null;
                }

                // CLI Overrides
                if (outputFlag === "-o") {
                    if (outputFileArg !== undefined) {
                        finalOutputFile = path.parse(outputFileArg).name;
                        finalOutputDir = outputDirArg !== undefined ? outputDirArg : finalOutputDir;
                    }
                }

                const createdFilePath = await generateOutput(finalOutputDir, finalOutputFile, format, sourcePath, mapperFile, config);
                const stats = await fs.stat(createdFilePath);
                const date = new Date().toLocaleString();

                console.log(success_msg(finalOutputDir, finalOutputFile, stats.size, date));

            } else {
                cliError([
                    `{line}<$red:Unrecognized file extension$> <$blue: '${file.ext}'$> , <$red: only files with file extension$> <$green:'.smark'$> <$red: are accepted.$>{line}`
                ]);
            }
        } else {
            cliError([
                `{line}<$magenta:File$> <$blue:'${sourcePath ? targetFile.name + targetFile.ext : "Unknown"}'$> <$magenta: is not found$>${(await isExist(targetFile.dir)) ? ` <$magenta: in directory$> <$yellow:${targetFile.dir}$>` : "."}`,
                `${sourcePath ? "" : "{N}<$magenta:<Unknown>$> -> <$yellow:means you did not define the file path.$>"}{line}`
            ]);
        }

    } catch (err) {
        console.error(err);
    }
}
