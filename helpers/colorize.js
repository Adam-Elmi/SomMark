const colors = {
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	reset: "\x1b[0m"
};

export let useColor = false;

export function enableColor(enabled = true) {
	useColor = enabled;
}

export default function colorize(color, text) {
	if (!text) throw new Error("argument 'text' is not defined.");
	if (useColor && color && colors[color]) {
		return colors[color] + text + colors["reset"];
	}
	return text;
}
