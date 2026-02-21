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

export async function runInit() {
    try {
        const configDir = getConfigDir();
        const pluginsDir = path.join(configDir, "plugins");
        const configFilePath = path.join(configDir, "smark.config.js");

        // ======================================================
        // Create directories
        // ======================================================

        await fs.mkdir(pluginsDir, { recursive: true });

        // ======================================================
        // Default configuration content
        // ======================================================

        const defaultConfigContent = `export default {
    outputDir: "",
    outputFile: "output",
    mappingFile: "",
};
`;

        // ======================================================
        // Check if config file already exists
        // ======================================================

        try {
            await fs.access(configFilePath);
            console.log(formatMessage(`<$yellow:Configuration already exists at:$> <$cyan:${configFilePath}$>`));
        } catch {
            // ======================================================
            // Create default config file if it doesn't exist
            // ======================================================

            await fs.writeFile(configFilePath, defaultConfigContent, "utf-8");
            console.log(formatMessage(`<$green:Initialized SomMark configuration at:$> <$cyan:${configFilePath}$>`));
        }
    } catch (error) {
        cliError([
            `{line}<$red:Failed to initialize SomMark configuration:$> <$magenta:${error.message}$>{line}`
        ]);
    }
}
