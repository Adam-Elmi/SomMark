// ###################
// Build worker: runs a page's ${ }$ code in its own thread, so the build can stop it
// ###################

import { parentPort } from "node:worker_threads";
import { evaluateInThread } from "./evaluator.js";
import { unsendable } from "../core/runtime.js";

// ###################
// Only plain data crosses back: exported values the browser can't take, and
// functions in props, become markers that give the usual errors later
// ###################
const mark = (message) => ({ __arcmUnsendable: message });

const makeSendable = (result) => {
	for (const use of result.uses) {
		for (const [name, value] of Object.entries(use.values)) {
			const problem = unsendable(value, name);
			if (problem) use.values[name] = mark(problem);
		}
	}
	const visit = (nodes) => {
		for (const node of nodes ?? []) {
			if (node.type !== "element") continue;
			for (const [key, value] of Object.entries(node.properties)) {
				if (typeof value === "function" || typeof value === "symbol") node.properties[key] = mark(`prop "${key}" on [${node.tagName}] is a ${typeof value}`);
			}
			visit(node.children);
		}
	};
	visit(result.tree.children);
	return result;
};

parentPort.on("message", async ({ id, graph, options }) => {
	try {
		const result = await evaluateInThread(graph, { ...options, timeout: 0, onRun: (file) => parentPort.postMessage({ id, running: file }) });
		try {
			parentPort.postMessage({ id, result: makeSendable(result) });
		} catch (err) {
			parentPort.postMessage({ id, error: { name: "EvaluatorError", message: `${graph.entry}  can't send the page's result back from the build worker: ${err.message}`, source: graph.entry } });
		}
	} catch (err) {
		parentPort.postMessage({
			id,
			error: { name: err?.name ?? "Error", message: err?.message ?? String(err), source: err?.source, position: err?.position, stack: err?.stack }
		});
	}
});
