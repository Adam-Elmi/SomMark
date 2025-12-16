export default function colorize(color, text) {
	const colors = {
		red: "\x1b[31m",
		green: "\x1b[32m",
		yellow: "\x1b[33m",
		blue: "\x1b[34m",
		magenta: "\x1b[35m",
		cyan: "\x1b[36m",
		reset: "\x1b[0m"
	};
	if (!text) throw new Error(`${colors["red"]}argument 'text' is not defined.${colors["reset"]}`);
	if (color) {
		return colors[color] + text + colors["reset"];
	} else {
		return text;
	}
}