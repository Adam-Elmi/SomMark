// ###################
// CLI reports: errors with code frames, warnings, results
// Colors turn off by themselves when output is not a terminal
// ###################

import pc from "picocolors";
import { readFileSync } from "node:fs";
import { relative, isAbsolute } from "node:path";
import { codeFrameColumns } from "@babel/code-frame";

const short = (file) => (file && isAbsolute(file) ? relative(process.cwd(), file) || file : file);

export const location = (source, position) =>
	position ? `${short(source)}:${position.line + 1}:${position.character + 1}` : short(source);

// ###################
// The source lines around a position, with a ^ under it
// ###################
const frame = (source, position) => {
	if (!source || !position) return null;
	try {
		const text = readFileSync(source, "utf8");
		const raw = codeFrameColumns(text, { start: { line: position.line + 1, column: position.character + 1 } }, { highlightCode: false, linesAbove: 1, linesBelow: 1 });
		return raw
			.split("\n")
			.map((line) => (line.startsWith(">") ? pc.red(">") + line.slice(1) : line.includes("^") ? line.replace(/\^+/, (m) => pc.red(m)) : pc.dim(line)))
			.join("\n");
	} catch {
		return null;
	}
};

// ###################
// ArcMoon errors start with "file:line:col  "; take it off the message
// ###################
const messageOf = (err) => {
	const text = String(err?.message ?? err);
	if (!err?.source) return text;
	const at = text.indexOf("  ");
	return at !== -1 && text.startsWith(err.source) ? text.slice(at + 2) : text;
};

export function reportError(err) {
	if (err?.name === "ProtectorError") return reportProtector(err.message);
	const lines = [`${pc.red("✗")} ${pc.bold(messageOf(err))}`];
	if (err?.source) lines.push(`  ${pc.cyan(location(err.source, err.position))}`);
	const code = frame(err?.source, err?.position);
	if (code) lines.push("", code.replace(/^/gm, "  "));
	console.error(lines.join("\n"));
}

export function reportWarning(w) {
	const where = w.source ? `${pc.cyan(location(w.source, w.position))}  ` : "";
	console.error(`${pc.yellow("⚠")} ${where}${w.message}`);
}

// ###################
// Report rows ("    import     a, b") with colored names
// ###################
export const rows = (text) =>
	text
		.split("\n")
		.map((line) => {
			const row = /^( {4})(\S+)( +)(.*)$/.exec(line);
			return row ? `${row[1]}${(row[2] === "risky" ? pc.red : pc.cyan)(row[2])}${row[3]}${row[4]}` : line;
		})
		.join("\n");

// ###################
// The protector report
// ###################
export function reportProtector(text) {
	const lines = rows(text)
		.split("\n")
		.map((line) => {
			if (line.startsWith("⚠")) return pc.yellow(line);
			if (line.trim() === "Nothing was run.") return `  ${pc.bold(line.trim())}`;
			return line.replace(/"arcmoon trust [^"]+"/, (m) => pc.green(m));
		});
	console.error(lines.join("\n"));
}

export const success = (text) => console.log(`${pc.green("✓")} ${text}`);

export const size = (bytes) => (bytes < 1000 ? `${bytes} B` : `${(bytes / 1000).toFixed(1)} kB`);

export const dim = pc.dim;
