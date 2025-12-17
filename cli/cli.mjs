#!/usr/bin/env node
import projectJson from "../package.json" with { type: "json" };
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { cliError } from "../core/validator.js";
import lexer from "../core/lexer.js";
import parser from "../core/parser.js";
import transpiler from "../core/transpiler.js";
import html from "../mapping/default_mode/smark.html.js";
import md from "../mapping/default_mode/smark.md.js";

/*
Cli features:
- Show the version
- Transpile to html (FILE)
- Transpile to md (FILE)
- Display output (No File)
*/

function getDescriptive() {
	return [
		projectJson.version && typeof parseFloat(projectJson.version) === "number" ? projectJson.version : "",
		"SomMark is a structural markup language for writing structured documents.",
		"Copyright (C) Adam Elmi",
		"Github: https://github.com/Adam-Elmi/SomMark"
	]
		.filter(value => value !== "")
		.join("\n");
}

function getVersion() {
	if (Array.isArray(process.argv) && process.argv.length > 0) {
		if (projectJson && projectJson.version !== undefined && process.argv[2] === "-v") {
			return projectJson.version;
		}
		return getDescriptive();
	}
}

const isExist = async path => {
	try {
		if (path) {
			await fs.access(path);
			return true;
		} else {
			throw new Error("Path is not found");
		}
	} catch (_) {
		return false;
	}
};

async function createFile(folder, file, content) {
	await fs.writeFile(path.join(folder, file), content);
}

async function readContent(path) {
	const content = await fs.readFile(path);
	return content;
}

const CONFIG_FILE_NAME = "smark.config.json";
const currentDir = process.cwd();
const configPath = path.join(currentDir, CONFIG_FILE_NAME);

let config = {
	outputFile: "output",
	outputDir: "",
	mode: "default",
	mappingFile: ""
};

async function loadConfig() {
	if (isExist(configPath)) {
		try {
			const configURL = pathToFileURL(configPath).href;
			const loadedModule = await import(configURL, {
				with: { type: "json" }
			});
			config = loadedModule.default;
		} catch (error) {
			console.error(`Error loading configuration file ${CONFIG_FILE_NAME}:`, error.message);
		}
	} else {
		console.log(`${CONFIG_FILE_NAME} not found. Using default configuration.`);
	}

	if (!config.outputDir) {
		config.outputDir = process.cwd();
	}
	return config;
}

async function transpile(src, format, mappingFile = "") {
	if ((await loadConfig()).mode === "default") {
		return transpiler(parser(lexer(src)), format, format === "html" ? html : md);
	} else if (mappingFile && isExist(mappingFile)) {
		return transpiler(parser(lexer(src)), format, mappingFile);
	} else {
		cliError([`{line}<$red:File$> <$blue:'${mappingFile}'$> <$red: is not found$>{line}`]);
	}
}
async function generateFile(format) {
	try {
		if (Array.isArray(process.argv) && process.argv.length > 0) {
			if (process.argv[2] === `--${format}`) {
				if (await isExist(process.argv[3])) {
					const file = path.parse(process.argv[3]);
					if (file.ext === ".smark") {
						if (!process.argv[4]) {
              const config = await loadConfig();
							const outputDir = config.outputDir;
							const outputFile = config.outputFile;
							// const content = (await readContent(config.mode === "default" ? ).toString();
							await createFile(outputDir, `${outputFile}.${format}`, content);
						}
					} else {
						cliError([
							`{line}<$red:Unrecognized file extension$> <$blue: '${file.ext}'$> , <$red: only files with file extension$> <$green:'.smark'$> <$red: are accepted.$>{line}`
						]);
					}
				} else {
					cliError([`{line}<$red:File$> <$blue:'${process.argv[3] ?? "Unknown"}'$> <$red: is not found$>{line}`]);
				}
			}
		}
	} catch (err) {
		console.error(err);
	}
}

const cli = {
	description: () => getDescriptive(),
	version: () => getVersion(),
	run: function () {
		this.version();
	}
};

generateFile("html");
