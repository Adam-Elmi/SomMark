#!/usr/bin/env node
import projectJson from "../package.json" with { type: "json" };
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { cliError, formatMessage } from "../core/validator.js";
import lexer from "../core/lexer.js";
import parser from "../core/parser.js";
import transpiler from "../core/transpiler.js";
import html from "../mapping/default_mode/smark.html.js";
import md from "../mapping/default_mode/smark.md.js";

const options = ["-v", "--version", "-h", "--help", "--html", "--md"];

function getHelp(unknown_option = true) {
	const msg = [
		`${unknown_option && process.argv[2] ? `<$red:Unrecognized option$> <$blue: '${process.argv[2]}'$>` : "<$cyan:[Help]$>"}`,
		"{N}<$yellow:Usage:$> <$blue:smark [options] [targetFile] [option] [outputFile] [outputDir]$>",
		"{N}<$yellow:Available options are:$>",
		"{N}  <$green:-h or --help$>      <$cyan: show help message$>",
		"{N}  <$green:-v or --version$>   <$cyan: show version information$>",
		"{N}  <$green:--html$>            <$cyan: transpile to html$>",
		"{N}  <$green:--md$>              <$cyan: transpile to markdown$>"
	].join("");
	const help_msg = formatMessage(msg);
	if (!options.includes(process.argv[2]) && unknown_option) {
		console.log(help_msg);
		process.exit(0);
	} else if (process.argv[2] === "-h") {
		console.log(help_msg);
		process.exit(0);
	}
}

if (process.argv[2] && (process.argv[2] === "-h" || process.argv[2] === "--help")) {
	getHelp(false);
} else {
	getHelp();
}

if (process.argv.length <= 2) {
	console.log(
		[
			projectJson.version && typeof parseFloat(projectJson.version) === "number" ? projectJson.version : "",
			"SomMark is a structural markup language for writing structured documents.",
			"Copyright (C) Adam Elmi",
			"Github: https://github.com/Adam-Elmi/SomMark"
		]
			.filter(value => value !== "")
			.join("\n")
	);
}

if (projectJson && projectJson.version !== undefined && (process.argv[2] === "-v" || process.argv[2] === "--version")) {
	console.log(projectJson.version);
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
	if (!(await isExist(folder))) {
		await fs.mkdir(folder, { recursive: true });
	}
	await fs.writeFile(path.join(folder, file), content);
}

async function readContent(path) {
	const content = await fs.readFile(path);
	return content;
}

const CONFIG_FILE_NAME = "smark.config.js";
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
			const loadedModule = await import(configURL);
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

async function generateOutput(outputDir, outputFile, format) {
	let source_code = await readContent(process.argv[3]);
	source_code = source_code.toString();
	const output = await transpile(source_code, format, config.mappingFile);
	await createFile(outputDir, `${outputFile}.${format}`, output);
}
async function generateFile() {
	try {
		const format_option = process.argv[2] ?? "";
		const format = format_option.replaceAll("-", "") ?? "";
		if (format && ["html", "md"].includes(format)) {
			if (Array.isArray(process.argv) && process.argv.length > 0) {
				const targetFile = process.argv[3] ? path.parse(process.argv[3]) : "";
				if (await isExist(process.argv[3])) {
					const file = path.parse(process.argv[3]);
					if (file.ext === ".smark") {
						const config = await loadConfig();
						const success_msg = (outputDir, outputFile) => {
							return formatMessage(
								[
									`{line}[<$yellow: STATUS$> : <$green: SUCCESS$>]{line}<$blue: File$> <$yellow:'${outputFile}.${format}'$> <$blue: is successfully created`,
									` in directory$> <$yellow: '${outputDir}'$>{line}`
								].join("")
							);
						};
						if (process.argv[4] === undefined) {
							if (config.mode === "default") {
								config.mappingFile = format === "html" ? html : format === "md" ? md : null;
							}
							generateOutput(config.outputDir, config.outputFile, format);
							console.log(success_msg(config.outputDir, config.outputFile));
						} else if (process.argv[4] === "-o") {
							if (process.argv[5] !== undefined) {
								config.outputFile = path.parse(process.argv[5]).name;
								config.outputDir = process.argv[6] !== undefined ? process.argv[6] : config.outputDir;
								generateOutput(config.outputDir, config.outputFile, format);
								console.log(success_msg(config.outputDir, config.outputFile));
							}
						}
					} else {
						cliError([
							`{line}<$red:Unrecognized file extension$> <$blue: '${file.ext}'$> , <$red: only files with file extension$> <$green:'.smark'$> <$red: are accepted.$>{line}`
						]);
					}
				} else {
					cliError([
						`{line}<$magenta:File$> <$blue:'${process.argv[3] ? targetFile.name + targetFile.ext : "Unknown"}'$> <$magenta: is not found$>${(await isExist(targetFile.dir)) ? ` <$magenta: in directory$> <$yellow:${targetFile.dir}$>` : "."}`,
						`${process.argv[3] ? "" : "{N}<$magenta:<Unknown>$> -> <$yellow:means you did not define the file path.$>"}{line}`
					]);
				}
			}
		}
	} catch (err) {
		console.error(err);
	}
}
generateFile();
