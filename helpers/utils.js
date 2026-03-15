import { sommarkError } from "../core/errors.js";

/**
 * Checks if a todo item should be checked.
 * @param {string} status 
 * @returns {boolean}
 */
export function todo(status = "") {
    return (status || "").trim() === "x" || (status || "").trim().toLowerCase() === "done";
}

/**
 * Matches a target ID within an array of output registration objects.
 */
export function matchedValue(outputs, targetId) {
	let result;
	for (const outputValue of outputs) {
		if (typeof outputValue.id === "string") {
			if (outputValue.id === targetId) {
				result = outputValue;
				break;
			}
		} else if (Array.isArray(outputValue.id)) {
			for (const id of outputValue.id) {
				if (id === targetId) {
					result = outputValue;
					break;
				}
			}
		}
	}
	return result;
}

/**
 * Safe argument retrieval with validation.
 */
export function safeArg(args, index, key, type = null, setType = null, fallBack = null) {
    if (!Array.isArray(args)) {
        sommarkError([`{line}<$red:TypeError:$> <$yellow:args must be an array$>{line}`]);
    }

    if (index === undefined && key === undefined) {
        sommarkError([`{line}<$red:ReferenceError:> <$yellow:At least one of 'index' or 'key' must be provided$>{line}`]);
    }

    const validate = value => {
        if (value === undefined) return false;
        if (!type) return true;
        const evaluated = setType ? setType(value) : value;
        return typeof evaluated === type;
    };

    if (index !== undefined && validate(args[index])) {
        return args[index];
    }

    if (key !== undefined && validate(args[key])) {
        return args[key];
    }

    return fallBack;
}

/**
 * Renders an HTML table.
 */
export function htmlTable(data, headers, escapeFn = (t) => t) {
    if (!data) return "";

    if (typeof data === "string") {
        data = data.split(/\r?\n/);
    } else if (!Array.isArray(data) || data.length === 0) {
        return "";
    }

    let tableHTML = `<table class="sommark-table">\n<thead>\n<tr>`;
    for (const header of headers) {
        tableHTML += `<th>${escapeFn(header)}</th>`;
    }
    tableHTML += "</tr>\n</thead>\n<tbody>\n";

    for (const row of data) {
        const trimmedRow = row.trim();
        if (!trimmedRow) continue;

        const rowData = trimmedRow.split(/(?<!\\),/).map(cell => {
            let text = cell.trim();
            if (text.endsWith(";")) text = text.slice(0, -1);
            return text.replace(/\\(.)/g, "$1");
        });

        tableHTML += "<tr>";
        for (const cell of rowData) {
            tableHTML += `<td>${escapeFn(cell.trim())}</td>`;
        }
        tableHTML += "</tr>\n";
    }

    tableHTML += "</tbody>\n</table>";
    return tableHTML;
}

/**
 * Parses a hierarchical list.
 */
export function parseList(data, indentSize = 2) {
    if (typeof data === "string") {
        data = data.split("\n");
    }
    const root = { level: -1, children: [] };
    const stack = [root];

    const getLevel = line => {
        const spaces = line.match(/^\s*/)[0].length;
        return Math.floor(spaces / indentSize);
    };

    for (const raw of data) {
        if (!raw.trim()) continue;
        const level = getLevel(raw);
        const text = raw.trim();

        const node = { text, children: [] };

        while (stack.length && stack[stack.length - 1].level >= level) {
            stack.pop();
        }

        stack[stack.length - 1].children.push(node);
        stack.push({ ...node, level });
    }

    return root.children;
}

/**
 * Renders a list (ul/ol).
 */
export function list(data, as = "ul", escapeFn = (t) => t) {
    const nodes = parseList(data);
    if (!Array.isArray(nodes) || nodes.length === 0) return "";

    const tag = as === "ol" ? "ol" : "ul";

    const renderItems = items => {
        let html = `<${tag}>`;
        for (const item of items) {
            html += `<li>`;
            html += escapeFn(item.text);
            if (item.children && item.children.length > 0) {
                html += renderItems(item.children);
            }
            html += `</li>`;
        }
        html += `</${tag}>`;
        return html;
    };

    return renderItems(nodes);
}
