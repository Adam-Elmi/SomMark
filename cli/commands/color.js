import { formatMessage } from "../../core/errors.js";

/**
 * Checks if colors are turned on in your settings.
 * @returns {Promise<boolean>}
 */
export async function isColorEnabled() {
    return process.env.SOMMARK_COLOR === "true";
}

/**
 * Shows the user how to turn colors on or off.
 * @param {string} action - 'on' or 'off'.
 */
export function runColor(action) {
    if (action === "on") {
        console.log(formatMessage([
            `{line}<$yellow:SomMark uses Environment Variables for colors:$>{line}`,
            `<$blue:Set this in your current shell:$>`,
            `  <$cyan:export SOMMARK_COLOR=true$>{line}`,
            `<$blue:Add it to your .bashrc or .zshrc for permanent effect.$>{line}`
        ].join("")));
    } else if (action === "off") {
        console.log(formatMessage([
            `{line}<$yellow:To disable colors, run:$>{line}`,
            `  <$cyan:export SOMMARK_COLOR=false$>{line}`,
            `<$blue:(Or remove the SOMMARK_COLOR variable from your shell config)$>{line}`
        ].join("")));
    } else {
        console.log(formatMessage(`Usage: <$blue:sommark color on|off$>`));
    }
}
