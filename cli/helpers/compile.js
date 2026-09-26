// ###################
// Compile one file with the project config
// ###################

import path from "node:path";
import ArcMoon, { loadGraph } from "../../node/compiler.js";

const options = (filename, config) => ({
	filename: path.resolve(filename),
	importAliases: config.importAliases ?? {},
	removeComments: config.removeComments ?? true,
	timeout: config.timeout ?? 5000,
	bundle: config.bundle ?? [],
	cwd: process.cwd()
});

export const compile = (filename, config) => new ArcMoon(options(filename, config)).compile();
export const graph = (filename, config) => loadGraph(options(filename, config));
