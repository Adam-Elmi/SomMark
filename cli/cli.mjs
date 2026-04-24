#!/usr/bin/env node
/**
 * SomMark CLI Entry Point
 * Reads your command-line arguments and runs the right tool.
 */
import { enableColor } from "../helpers/colorize.js";

import { getHelp } from "./commands/help.js";
import { printVersion, printHeader } from "./commands/version.js";
import { runBuild } from "./commands/build.js";
import { printOutput, printLex, printParse } from "./commands/print.js";
import { runInit } from "./commands/init.js";
import { runShow } from "./commands/show.js";
import { runColor } from "./commands/color.js";
import { extensions } from "./constants.js";

// ========================================================================== //
//  Color Support                                                             //
// ========================================================================== //
import { isColorEnabled } from "./commands/color.js";

if (process.env.SOMMARK_COLOR === "true" || await isColorEnabled()) {
	enableColor(true);
}

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

	// 4. Init (Always Local)
	if (command === "init") {
		await runInit();
		return;
	}



	// 5. Show
	if (command === "show") {
		await runShow(args[1]);
		return;
	}

	// 5.5. Color
	if (command === "color") {
		runColor(args[1]);
		return;
	}
	

	// 6. Lex
	if (command === "--lex") {
		await printLex(args[1]);
		return;
	}

	// 7. Parse
	if (command === "--parse") {
		await printParse(args[1]);
		return;
	}

	// 9. Print to Console ( -p or --print )

	const format = command ? command.replace(/^--/, "") : "";

	if (extensions[format]) {
		// Build or Print
		if (args[1] === "-p" || args[1] === "--print") {
			await printOutput(format, args[2]);
			process.exit(0);
		} else {
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
