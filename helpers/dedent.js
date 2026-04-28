/**
 * Dedents a string by a given amount of characters.
 * 
 * @param {string} str - The string to dedent.
 * @param {number} amount - The number of characters to remove from the start of each line.
 * @returns {string} - The dedented string.
 */
export function dedentBy(str, amount) {
	if (!str || amount <= 0) return str;
	const lines = str.split("\n");
	const dedentedLines = lines.map((line) => {
		let count = 0;
		while (count < amount && (line[count] === " " || line[count] === "\t")) {
			count++;
		}
		return line.slice(count);
	});
	return dedentedLines.join("\n");
}
