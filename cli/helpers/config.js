import path from "node:path";
import { pathToFileURL } from "node:url";
import { isExist } from "./file.js";
import { getConfigDir } from "../commands/init.js";

// ========================================================================== //
//  Configuration Loader                                                      //
// ========================================================================== //

const CONFIG_FILE_NAME = "smark.config.js";
const currentDir = process.cwd();
const localConfigPath = path.join(currentDir, CONFIG_FILE_NAME);

// ========================================================================== //
//  Default Configuration                                                     //
// ========================================================================== //
let config = {
    outputFile: "output",
    outputDir: "",
    mappingFile: ""
};

// ========================================================================== //
//  Load Configuration                                                        //
// ========================================================================== //
export async function loadConfig() {
    const userConfigPath = path.join(getConfigDir(), CONFIG_FILE_NAME);
    let targetConfigPath = null;

    if (await isExist(userConfigPath)) {
        targetConfigPath = userConfigPath;
    } else if (await isExist(localConfigPath)) {
        targetConfigPath = localConfigPath;
    }

    if (targetConfigPath) {
        try {
            const configURL = pathToFileURL(targetConfigPath).href;
            const loadedModule = await import(configURL);
            config = loadedModule.default || loadedModule;
        } catch (error) {
            console.error(`Error loading configuration file ${targetConfigPath}:`, error.message);
        }
    } else {
        // console.log(`${CONFIG_FILE_NAME} not found. Using default configuration.`);
    }

    if (!config.outputDir) {
        config.outputDir = process.cwd();
    }
    return config;
}
