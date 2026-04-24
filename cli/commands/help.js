import { formatMessage } from "../../core/errors.js";
import { options } from "../constants.js";

// ========================================================================== //
//  Help Command                                                              //
// ========================================================================== //

/**
 * Displays the CLI help message.
 * @param {boolean} [unknown_option=true] - Whether to show the "Unrecognized option" prefix if an invalid flag is passed.
 * @returns {string} - The formatted help message.
 */
export function getHelp(unknown_option = true) {
	const msg = [
		`${unknown_option && process.argv[2] ? `<$red:Unrecognized option$> <$blue: '${process.argv[2]}'$>` : ""}`,
		"{N}<$yellow:Usage:$> <$blue:sommark [option]$>",

		"{N}{N}<$yellow:Global Options:$>",
		"{N}  <$green:-h, --help$>     <$cyan: Show help message$>",
		"{N}  <$green:-v, --version$>  <$cyan: Show version information$>",
		"{N}  <$green:init$>           <$cyan: Initialize local SomMark configuration file (smark.config.js)$>",
		"{N}  <$green:show config$>    <$cyan: Display the absolute paths to the active SomMark configuration files$>",
		"{N}  <$green:color on|off$>   <$cyan: Help on enabling colors via Environment Variables$>",

		"{N}{N}<$yellow:Transpilation Options:$>",
		"{N}<$yellow:Usage:$> <$blue:sommark [option] [targetFile] [option] [outputFile] [outputDir]$>",
		"{N}  <$green:--html$>         <$cyan: Transpile to HTML$>",
		"{N}  <$green:--markdown$>     <$cyan: Transpile to Markdown$>",
		"{N}  <$green:--mdx$>          <$cyan: Transpile to MDX$>",
		"{N}  <$green:--json$>         <$cyan: Transpile to JSON$>",
		"{N}  <$green:--text$>         <$cyan: Transpile to plain text$>",
		"{N}  <$green:--lex$>          <$cyan: Print lexer tokens to console$>",
		"{N}  <$green:--parse$>        <$cyan: Print parser AST to console$>",

		"{N}{N}<$yellow:Output & Config Overrides:$>",
		"{N}  <$green:-p, --print$>    <$cyan: Print output to console (stdout)$>",
		"{N}  <$green:-o$>             <$cyan: Specify output filename (and optionally directory)$>",

		"{N}{N}<$yellow:Examples:$>",
		"{N}  <$magenta:1. Basic usage:$> <$blue:sommark --html input.smark$>",
		"{N}  <$magenta:2. Custom output:$> <$blue:sommark --html input.smark -o myOutput ./dist/$>"
	].join("");
	const help_msg = formatMessage(msg);

	if (!options.includes(process.argv[2]) && unknown_option) {
		console.log(help_msg);
		process.exit(0);
	} else if (process.argv[2] === "-h" || process.argv[2] === "--help") {
		console.log(help_msg);
		process.exit(0);
	}
	return help_msg;
}
