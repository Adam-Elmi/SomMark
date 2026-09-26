// ###################
// arcmoon.config.js, only from the folder where arcmoon runs
// ###################

import path from "node:path";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { isExist } from "./file.js";
import { CONFIG_FILE } from "../constants.js";
import { reportWarning } from "./report.js";

let resolvedConfigPath = null;

export async function loadConfig(root = process.cwd()) {
	const file = path.join(root, CONFIG_FILE);
	if (!(await isExist(file))) {
		resolvedConfigPath = null;
		return {};
	}
	resolvedConfigPath = file;
	const loaded = await import(`${pathToFileURL(file).href}?t=${Date.now()}`);
	const empty = !(await readFile(file, "utf8")).trim();
	if (empty || loaded.default === undefined) {
		reportWarning({ message: `${file} exports nothing; using the default settings. Add "export default { … }".` });
	}
	const config = loaded.default ?? {};
	if (typeof config !== "object" || Array.isArray(config)) throw new Error(`${CONFIG_FILE} must export an object`);
	return config;
}

export const getResolvedConfigPath = () => resolvedConfigPath;
