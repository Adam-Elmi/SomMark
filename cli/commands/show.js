// ###################
// show config / show --path-config
// ###################

import { loadConfig, getResolvedConfigPath } from "../helpers/config.js";
import { cliError } from "../helpers/errors.js";
import { CONFIG_FILE } from "../constants.js";

export async function runShow(what) {
	const config = await loadConfig();
	if (what === "config") return console.log(JSON.stringify(config, null, 2));
	if (what === "--path-config") return console.log(getResolvedConfigPath() ?? `no ${CONFIG_FILE} in ${process.cwd()}`);
	cliError(`unknown "show ${what ?? ""}"; use "show config" or "show --path-config"`);
}
