import path from "node:path";
import { pathToFileURL } from "node:url";
import { isExist } from "./file.js";

// ========================================================================== //
//  Configuration Loader                                                      //
// ========================================================================== //

const CONFIG_FILE_NAME = "smark.config.js";
const currentDir = process.cwd();
const configPath = path.join(currentDir, CONFIG_FILE_NAME);

// ========================================================================== //
//  Default Configuration                                                     //
// ========================================================================== //
let config = {
    outputFile: "output",
    outputDir: "",
    mode: "default",
    mappingFile: ""
};

// ========================================================================== //
//  Load Configuration                                                        //
// ========================================================================== //
export async function loadConfig() {
    if (await isExist(configPath)) {
        try {
            const configURL = pathToFileURL(configPath).href;
            const loadedModule = await import(configURL);
            config = loadedModule.default || loadedModule;
        } catch (error) {
            console.error(`Error loading configuration file ${CONFIG_FILE_NAME}:`, error.message);
        }
    } else {
        // console.log(`${CONFIG_FILE_NAME} not found. Using default configuration.`);
    }

    if (!config.outputDir) {
        config.outputDir = process.cwd();
    }
    return config;
}
