const colors = {
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        reset: "\x1b[0m"
};

/** @type {boolean} If true, the CLI will show colors. */
export let useColor = false;

/**
 * Turns colors on or off globally.
 * @param {boolean} [enabled=true] - Set to true to see colors, false to hide them.
 */
export function enableColor(enabled = true) {
        useColor = enabled;
}

/**
 * Wraps your text in a color if colors are turned on.
 * 
 * @param {string} color - The color to use (red, green, yellow, blue, magenta, or cyan).
 * @param {string} text - The text you want to color.
 * @returns {string} - The colored text, or plain text if colors are off.
 * @throws {Error} - Fails if you forget to provide the text.
 */
export default function colorize(color, text) {
        if (!text) throw new Error("argument 'text' is not defined.");
        if (useColor && color && colors[color]) {
                return colors[color] + text + colors["reset"];
        }
        return text;
}
