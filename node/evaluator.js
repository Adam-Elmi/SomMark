// ###################
// Node.js evaluator: loads render code from a temp .mjs file next to the .arcm file
// ###################

import { writeFile, unlink } from "node:fs/promises";
import { dirname, join, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import evaluateCore, { EvaluatorError } from "../core/evaluator.js";

export { EvaluatorError };

export default function evaluate(graph, options = {}) {
	const cwd = options.cwd ?? process.cwd();

	// ###################
	// The temp file sits next to the .arcm file, so npm packages resolve from there
	// ###################
	const importModule = async (code, id) => {
		const dir = isAbsolute(id) ? dirname(id) : cwd;
		const hash = createHash("sha1").update(id + code).digest("hex").slice(0, 12);
		const file = join(dir, `.arcm-${hash}.mjs`);
		const href = pathToFileURL(file).href;

		await writeFile(file, code);
		try {
			return { render: (await import(href)).default, keys: [href, file] };
		} catch (err) {
			const pkg = /Cannot find package '([^']+)'/.exec(err.message);
			const mod = /Cannot find module '([^']+)'/.exec(err.message);
			if (pkg) throw new EvaluatorError(`can't find package "${pkg[1]}"; run npm install ${pkg[1]}`, id, null, err);
			if (mod) throw new EvaluatorError(`can't find file "${mod[1]}"`, id, null, err);
			throw err;
		} finally {
			await unlink(file).catch(() => {});
		}
	};

	return evaluateCore(graph, { ...options, importModule });
}
