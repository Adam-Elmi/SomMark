import { cliError, formatMessage } from "../../core/errors.js";
import { loadConfig, getResolvedConfigPath } from "../helpers/config.js";

// ========================================================================== //
//  Show Command                                                              //
// ========================================================================== //

/**
 * Shows the configuration data or where the settings file is located.
 * @param {string} target - The target to show ('config' or '--path-config').
 */
export async function runShow(target) {
    const config = await loadConfig();
    const resolvedPath = getResolvedConfigPath();

    if (target === "config") {
        try {
            console.log(formatMessage(`{N}<$yellow:SomMark Configuration Data:$>{N}`));
            
            // Format config for display (hide large objects)
            const displayConfig = { ...config };
            if (displayConfig.mappingFile && typeof displayConfig.mappingFile === "object") {
                displayConfig.mappingFile = "[Mapper Object]";
            }
            
            console.log(JSON.stringify(displayConfig, null, 4));
            console.log("");
        } catch (error) {
            cliError([
                `{line}<$red:Failed to retrieve configuration data:$> <$magenta:${error.message}$>{line}`
            ]);
        }
    } else if (target === "--path-config") {
        console.log(formatMessage(`{N}<$yellow:SomMark Configuration Path:$>{N}`));
        if (resolvedPath) {
            console.log(formatMessage(`  <$green:${resolvedPath}$>{N}`));
        } else {
            console.log(formatMessage(`  <$red:No configuration file found. Using defaults.$>{N}`));
        }
    } else {
        cliError([
            `{line}<$red:Invalid target for 'show' command:$> <$blue:'${target || ""}'$> `,
            `{N}<$yellow:Usage:$> {N} <$cyan:sommark show config$>        - Displays configuration data`,
            ` <$cyan:sommark show --path-config$> - Displays configuration file path{line}`
        ]);
    }
}
