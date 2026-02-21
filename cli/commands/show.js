import fs from "node:fs/promises";
import path from "node:path";
import { cliError, formatMessage } from "../../core/errors.js";
import { getConfigDir } from "./init.js";

// ========================================================================== //
//  Show Command                                                              //
// ========================================================================== //

export async function runShow(target) {
    if (target === "config") {
        try {
            const configDir = getConfigDir();
            const configFilePath = path.join(configDir, "smark.config.js");
            const pluginsDir = path.join(configDir, "plugins");
            //========================================================================== //
            //  Helper to check existence and format message                               //
            //========================================================================== //
            const checkPath = async (itemPath, isDir = false) => {
                try {
                    await fs.access(itemPath);
                    return `<$green:${itemPath}$> <$cyan:(Exists)$>`;
                } catch {
                    return `<$red:${itemPath}$> <$yellow:(Not Found)$>`;
                }
            };

            const configStatus = await checkPath(configFilePath);
            const pluginsStatus = await checkPath(pluginsDir, true);

            console.log(formatMessage(`{N}<$yellow:SomMark Configuration Files:$>{N}`));
            console.log(formatMessage(`  <$magenta:Config File:$>    ${configStatus}`));
            console.log(formatMessage(`  <$magenta:Plugins Dir:$>    ${pluginsStatus}{N}`));

        } catch (error) {
            cliError([
                `{line}<$red:Failed to retrieve configuration paths:$> <$magenta:${error.message}$>{line}`
            ]);
        }
    } else {
        cliError([
            `{line}<$red:Invalid target for 'show' command:$> <$blue:'${target || ""}'$> `,
            `<$yellow:Usage:$> <$cyan:sommark show config$>{line}`
        ]);
    }
}
