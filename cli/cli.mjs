#!/usr/bin/env node
import { getHelp } from "./commands/help.js";
import { printVersion, printHeader } from "./commands/version.js";
import { runBuild } from "./commands/build.js";
import { printOutput } from "./commands/print.js";
import { runInit } from "./commands/init.js";
import { runShow } from "./commands/show.js";
import { extensions } from "./constants.js";

// ========================================================================== //
//  Argument Parsing                                                          //
// ========================================================================== //
const args = process.argv.slice(2);
const command = args[0];

// ========================================================================== //
//  Main Execution                                                            //
// ========================================================================== //
async function main() {
	// 1. Help
	if (command && (command === "-h" || command === "--help")) {
		getHelp(false);
		return;
	}

	// 2. No Arguments -> Header
	if (args.length === 0) {
		printHeader();
		return;
	}

	// 3. Version
	if (command === "-v" || command === "--version") {
		printVersion();
		return;
	}

	// 4. Init
	if (command === "init") {
		await runInit();
		return;
	}

	// 5. Show
	if (command === "show") {
		await runShow(args[1]);
		return;
	}

	// 6. Print to Console ( -p or --print )

	const format = command ? command.replace(/^--/, "") : "";

	if (extensions[format]) {
		// Build or Print
		if (args[1] === "-p" || args[1] === "--print") {
			// smark --format -p file
			// args[0]=--format, args[1]=-p, args[2]=file
			await printOutput(format, args[2]);
			process.exit(0);
		} else {
			// smark --format file [options]
			// args[0]=--format, args[1]=file, args[2]=-o, args[3]=output...

			await runBuild(
				command,      // format_option (--markdown)
				args[1],      // sourcePath
				args[2],      // outputFlag (-o)
				args[3],      // outputFileArg
				args[4]       // outputDirArg
			);
		}
		return;
	}

	// 5. Default Fallback
	getHelp();
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
