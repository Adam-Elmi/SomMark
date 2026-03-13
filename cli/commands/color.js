import fs from "node:fs/promises";
import path from "node:path";
import { getConfigDir } from "./init.js";

// ========================================================================== //
//  Color Command                                                              //
// ========================================================================== //

const COLOR_FILE = "color.json";

function getColorFilePath() {
    return path.join(getConfigDir(), COLOR_FILE);
}

export async function isColorEnabled() {
    try {
        const data = await fs.readFile(getColorFilePath(), "utf-8");
        return JSON.parse(data).enabled === true;
    } catch {
        return false;
    }
}

export function runColor(action) {
    if (action === "on") {
        fs.mkdir(getConfigDir(), { recursive: true })
            .then(() => fs.writeFile(getColorFilePath(), JSON.stringify({ enabled: true }), "utf-8"))
            .then(() => console.log("Colors enabled."));
    } else if (action === "off") {
        fs.mkdir(getConfigDir(), { recursive: true })
            .then(() => fs.writeFile(getColorFilePath(), JSON.stringify({ enabled: false }), "utf-8"))
            .then(() => console.log("Colors disabled."));
    } else {
        console.log("Usage: sommark color <on|off>");
    }
}
