// ###################
// build: .arcm files to .html files
// ###################

import path from "node:path";
import { arcmFiles, createFile } from "../helpers/file.js";
import { loadConfig } from "../helpers/config.js";
import { compile } from "../helpers/compile.js";
import { cliError } from "../helpers/errors.js";

export async function runBuild(args) {
	const target = args.find((a, i) => !a.startsWith("-") && args[i - 1] !== "-o");
	const print = args.includes("-p") || args.includes("--print");
	const outIndex = args.indexOf("-o");
	if (!target) cliError("missing file or folder: arcmoon build <file|dir>");
	if (outIndex !== -1 && !args[outIndex + 1]) cliError("missing folder after -o");

	try {
		const config = await loadConfig();
		const files = await arcmFiles(target);
		if (print && files.length > 1) cliError("-p prints one file; pass a .arcm file, not a folder");
		const outDir = outIndex !== -1 ? args[outIndex + 1] : config.outDir ?? "./dist";

		for (const file of files) {
			const html = await compile(file, config);
			if (print) {
				console.log(html);
				continue;
			}
			const name = `${path.basename(file, ".arcm")}.html`;
			await createFile(outDir, name, html);
			console.log(`✓ ${file} → ${path.join(outDir, name)} (${Buffer.byteLength(html)} bytes)`);
		}
	} catch (err) {
		cliError(err.message);
	}
}
