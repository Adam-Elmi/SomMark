import { cliError, formatMessage } from "../../core/errors.js";
import { loadConfig, getResolvedConfigPath } from "../helpers/config.js";

// ========================================================================== //
//  Show Command                                                              //
// ========================================================================== //

/**
 * Shows the configuration data or where the settings file is located.
 * @param {string} target - The target to show ('config' or '--path-config').
 * @param {string|null} [filePath=null] - Optional file path to show config for.
 */
export async function runShow(target, filePath = null) {
    const config = await loadConfig(filePath);
    const resolvedPath = getResolvedConfigPath();
    const contextText = filePath ? ` for <$blue:'${filePath}'$>` : "";

    if (target === "config") {
        try {
            console.log(formatMessage(`{N}<$yellow:SomMark Configuration Data$>${contextText}<$yellow::$>{N}`));
            
            // Format config for display (hide large objects and internal metadata)
            const displayConfig = { ...config };
            const configPath = displayConfig.resolvedConfigPath;
            delete displayConfig.resolvedConfigPath;
            
            if (displayConfig.mapperFile && typeof displayConfig.mapperFile === "object") {
                displayConfig.mapperFile = "[Mapper Object]";
            }
            
            console.log(JSON.stringify(displayConfig, null, 4));
            
            if (configPath) {
                console.log(formatMessage(`{N}<$yellow:Active Config Path:$> <$green:${configPath}$>{N}`));
            } else {
                console.log(formatMessage(`{N}<$yellow:Active Config Path:$> <$red:None (Using Defaults)$>{N}`));
            }
        } catch (error) {
            cliError([
                `{line}<$red:Failed to retrieve configuration data:$> <$magenta:${error.message}$>{line}`
            ]);
        }
    } else if (target === "--path-config") {
        console.log(formatMessage(`{N}<$yellow:SomMark Configuration Path$>${contextText}<$yellow::$>{N}`));
        if (resolvedPath) {
            console.log(formatMessage(`  <$green:${resolvedPath}$>{N}`));
        } else {
            console.log(formatMessage(`  <$red:No configuration file found. Using defaults.$>{N}`));
        }
    } else {
        cliError([
            `{line}<$red:Invalid target for 'show' command:$> <$blue:'${target || ""}'$> `,
            `{N}<$yellow:Usage:$> {N} <$cyan:sommark show config [file]$>        - Displays configuration data`,
            ` <$cyan:sommark show --path-config [file]$> - Displays configuration file path{line}`
        ]);
    }
}
