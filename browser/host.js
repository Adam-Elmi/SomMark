// ###################
// Files in the browser: virtual files first, then fetch from baseUrl
// ###################

import { resolve, dirname, normalize } from "pathe";

// ###################
// Every id is a path from the virtual root: "/pages/index.arcm"
// ###################
export const toId = (path) => normalize(path.startsWith("/") ? path : `/${path}`);

export function createHost({ files = {}, baseUrl = null } = {}) {
	const table = new Map(Object.entries(files).map(([path, text]) => [toId(path), text]));
	const fetched = new Map();

	const readFile = async (id) => {
		if (table.has(id)) return table.get(id);
		if (fetched.has(id)) return fetched.get(id);
		if (!baseUrl) throw new Error(`"${id}" is not in files, and no baseUrl is set`);
		const url = new URL(id.slice(1), baseUrl);
		const res = await fetch(url);
		if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`);
		const text = await res.text();
		fetched.set(id, text);
		return text;
	};

	// ###################
	// Sync reads only see files already in memory
	// ###################
	const readFileSync = (id) => {
		if (table.has(id)) return table.get(id);
		if (fetched.has(id)) return fetched.get(id);
		throw new Error(`"${id}" is not loaded; use readFile from node:fs/promises to fetch it`);
	};

	return {
		resolve: (path, from) => {
			if (path.startsWith("/")) return toId(path);
			if (path.startsWith(".")) return resolve(dirname(from), path);
			return toId(`/node_modules/${path}`);
		},
		readFile,
		readFileSync,
		exists: (id) => table.has(id) || fetched.has(id)
	};
}
