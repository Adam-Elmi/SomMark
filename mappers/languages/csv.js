import Mapper from "../mapper.js";
import { registerSharedOutputs } from "../shared/index.js";

const csvEscape = (value) => {
	const str = String(value ?? "").trim();
	if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
};

const rowFromProps = (props) =>
	Object.keys(props)
		.filter(k => !isNaN(parseInt(k)))
		.sort((a, b) => parseInt(a) - parseInt(b))
		.map(k => csvEscape(props[k]))
		.join(",");

const renderRow = async ({ props, ast, isSelfClosing, renderChild }) => {
	if (isSelfClosing) return rowFromProps(props) + "\n";
	const cells = [];
	for (const child of ast.body.filter(c => c.type === "Block")) {
		const out = await renderChild(child);
		if (out != null && out !== "") cells.push(out);
	}
	return cells.join(",") + "\n";
};

const CSV = Mapper.define({
	comment(text) {
		return `# ${text}`;
	},
	text(text) {
		return text.trim() === "" ? "" : text;
	}
});

/**
 * [header] — header row
 * Self-closing: [header = "name", "age", "city" !]
 * Body form:    [header][col]name[end][col]age[end][end]
 */
CSV.register(["header", "thead"], renderRow, { handleAst: true });

/**
 * [row] / [tr] — data row
 * Self-closing: [row = "Alice", "30", "New York" !]
 * Body form:    [row][col]Alice[end][col]30[end][end]
 */
CSV.register(["row", "tr"], renderRow, { handleAst: true });

/**
 * [col] / [cell] / [td] — single cell, used inside body-form rows
 * [col]New York, NY[end]
 */
CSV.register(["col", "cell", "td"], ({ textContent }) => {
	return csvEscape(textContent);
}, { handleAst: true, trimAndWrapBlocks: false });

registerSharedOutputs(CSV);

export default CSV;
