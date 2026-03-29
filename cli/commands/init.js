import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { cliError, formatMessage } from "../../core/errors.js";

// ========================================================================== //
//  Init Command                                                              //
// ========================================================================== //

export function getConfigDir() {
    const homeDir = os.homedir();
    if (process.platform === "win32") {
        return path.join(process.env.APPDATA || path.join(homeDir, "AppData", "Roaming"), "sommark");
    } else if (process.platform === "darwin") {
        return path.join(homeDir, "Library", "Application Support", "sommark");
    } else {
        return path.join(process.env.XDG_CONFIG_HOME || path.join(homeDir, ".config"), "sommark");
    }
}

export async function runInit(isLocal = false) {
    try {
        const configDir = isLocal ? process.cwd() : getConfigDir();
        const configFilePath = path.join(configDir, "smark.config.js");

        if (!isLocal) {
            await fs.mkdir(configDir, { recursive: true });
        }

        const defaultConfigContent = `export default {
    outputDir: "./",
    outputFile: "output",
    mappingFile: null,
    plugins: [],
    priority: [],
    excludePlugins: [],
};
`;

        try {
            await fs.access(configFilePath);
            console.log(formatMessage(`<$yellow:Configuration already exists at:$> <$cyan:${configFilePath}$>`));
        } catch {
            await fs.writeFile(configFilePath, defaultConfigContent, "utf-8");
            console.log(formatMessage(`<$green:Initialized SomMark configuration at:$> <$cyan:${configFilePath}$>`));
        }
    } catch (error) {
        cliError([
            `{line}<$red:Failed to initialize SomMark configuration:$> <$magenta:${error.message}$>{line}`
        ]);
    }
}

