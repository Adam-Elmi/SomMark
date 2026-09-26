// ###################
// File helpers
// ###################

import fs from "node:fs/promises";
import path from "node:path";
import { EXTENSION } from "../constants.js";

export const isExist = async (p) => {
	if (!p) return false;
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
};

export const isDirectory = async (p) => {
	try {
		return (await fs.stat(p)).isDirectory();
	} catch {
		return false;
	}
};

export const createFile = async (folder, file, content) => {
	await fs.mkdir(folder, { recursive: true });
	await fs.writeFile(path.join(folder, file), content);
};

// ###################
// A .arcm file, or the .arcm files directly inside a folder
// ###################
export const arcmFiles = async (target) => {
	if (!(await isExist(target))) throw new Error(`"${target}" is not found`);
	if (await isDirectory(target)) {
		const names = (await fs.readdir(target)).filter((n) => n.endsWith(EXTENSION)).sort();
		if (!names.length) throw new Error(`no ${EXTENSION} files in "${target}"`);
		return names.map((n) => path.join(target, n));
	}
	if (!target.endsWith(EXTENSION)) throw new Error(`only ${EXTENSION} files are accepted, got "${target}"`);
	return [target];
};
