#!/usr/bin/env node
import projectJson from "../package.json" with { type: "json" };
import fs from "node:fs/promises";
import path from "node:path";

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
			throw new Error("PROVIDE THE PATH!");
		}
	} catch (_) {
		return false;
	}
};

async function generate_file(file, folder, content) {
	await fs.writeFile(path.join(folder, file), content);
}

async function readContent(path) {
	const content = await fs.readFile(path);
	return content;
}

async function generate_html_file() {
	if (Array.isArray(process.argv) && process.argv.length > 0) {
		if (process.argv[2] === "--html") {
			if (process.argv[3] && isExist(process.argv[3])) {
				let content = await readContent(process.argv[3]);
        content = content.toString();
        console.log(content);
				if (process.argv[4] && isExist(process.argv[4])) {
					generate_file(process.argv[5] ?? "output.html", process.argv[4], content);
				} else {
				generate_file(process.argv[5] ?? "output.html", process.cwd(), content);
				}
			} else {
			}
		}
	}
}

const cli = {
	description: () => getDescriptive(),
	version: () => getVersion(),
	run: function () {
    this.version();
	}
};

generate_html_file()
