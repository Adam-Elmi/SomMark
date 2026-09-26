// ###################
// The whole browser compile, as run inside the worker
// ###################

import loadModules from "../core/modules.js";
import unknownTags from "../core/tags.js";
import evaluate from "../core/evaluator.js";
import { createHost, toId } from "./host.js";
import { createLoader } from "./modules.js";
import { installNode } from "./polyfills.js";

export async function compileInWorker(request, { toModuleURL }) {
	const {
		src,
		filename = "/anonymous.arcm",
		files = {},
		baseUrl = null,
		packages = {},
		props = {},
		env = {},
		importAliases = {},
		removeComments = true,
		timeout = 5000,
		version = "0.0.0"
	} = request;

	const host = createHost({ files, baseUrl });
	installNode(host, env);

	const aliases = Object.fromEntries(Object.entries(importAliases).map(([alias, target]) => [alias, toId(target)]));
	const graph = await loadModules({ id: toId(filename), src }, host, { importAliases: aliases });

	const warnings = unknownTags(graph);

	const { importModule } = createLoader({ host, packages, toModuleURL });
	const result = await evaluate(graph, { props, removeComments, timeout, version, importModule });
	warnings.push(...result.warnings);
	return { tree: result.tree, uses: result.uses, modules: result.modules, warnings };
}
