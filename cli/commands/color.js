import { formatMessage } from "../../core/errors.js";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const SOMMARK_CONFIG_DIR = path.join(os.homedir(), ".sommark");
const SOMMARK_CONFIG_FILE = path.join(SOMMARK_CONFIG_DIR, "config.json");

/**
 * Reads the user-level SomMark config from ~/.sommark/config.json.
 * @returns {Promise<Object>}
 */
async function readUserConfig() {
    try {
        const raw = await fs.readFile(SOMMARK_CONFIG_FILE, "utf-8");
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

/**
 * Writes a key/value pair to ~/.sommark/config.json.
 */
async function writeUserConfig(data) {
    await fs.mkdir(SOMMARK_CONFIG_DIR, { recursive: true });
    const existing = await readUserConfig();
    await fs.writeFile(SOMMARK_CONFIG_FILE, JSON.stringify({ ...existing, ...data }, null, 2));
}

/**
 * Checks if colors are enabled — reads from user config or SOMMARK_COLOR env var.
 * @returns {Promise<boolean>}
 */
export async function isColorEnabled() {
    if (process.env.SOMMARK_COLOR === "true") return true;
    if (process.env.SOMMARK_COLOR === "false") return false;
    const config = await readUserConfig();
    return config.color === true;
}

/**
 * Instructs the user how to enable or disable color output via the environment variable.
 * @param {string} action - 'on' or 'off'.
 */
export function runColor(action) {
    if (action === "on") {
        console.log(formatMessage(`Set <$cyan:SOMMARK_COLOR=true$> in your shell environment to enable colors.`));
    } else if (action === "off") {
        console.log(formatMessage(`Set <$cyan:SOMMARK_COLOR=false$> in your shell environment to disable colors.`));
    } else {
        console.log(formatMessage(`Usage: <$blue:sommark color on|off$>`));
    }
}
