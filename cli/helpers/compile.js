// ###################
// Compile one file with the project config
// ###################

import path from "node:path";
import ArcMoon, { loadGraph, buildPages } from "../../node/compiler.js";
import { reportWarning } from "./report.js";

const options = (filename, config) => ({
	filename: path.resolve(filename),
	importAliases: config.importAliases ?? {},
	removeComments: config.removeComments ?? true,
	timeout: config.timeout ?? 5000,
	bundle: config.bundle ?? [],
	cwd: process.cwd(),
	onWarning: reportWarning
});

export const compile = (filename, config) => new ArcMoon(options(filename, config)).compile();
export const graph = (filename, config) => loadGraph(options(filename, config));

// ###################
// Many files at once: JS / CSS inside each page, or separate files
// ###################
export const build = (filenames, config, outDir) =>
	buildPages(filenames.map((f) => options(f, config)), {
		cwd: process.cwd(),
		outDir,
		assetsDir: config.assetsDir ?? "assets",
		base: config.base,
		bundle: config.bundle ?? [],
		externalScripts: config.externalScripts ?? false,
		externalStyles: config.externalStyles ?? false,
		onWarning: reportWarning
	});
