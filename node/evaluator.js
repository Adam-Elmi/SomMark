// ###################
// Node.js evaluator: ${ }$ runs in a worker thread, so a page that runs too long is stopped
// Inside the worker, render code loads through Node's module hooks (no file is written)
// ###################

import module from "node:module";
import { writeFile, unlink } from "node:fs/promises";
import { dirname, join, isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { Worker } from "node:worker_threads";
import evaluateCore, { EvaluatorError } from "../core/evaluator.js";

export { EvaluatorError };

// ###################
// Render code by URL: hooks serve it as if it were a file next to the .arcm file
// ###################
const sources = new Map();
let hooked = null;

const hook = () => {
	if (hooked !== null) return hooked;
	// ###################
	// registerHooks needs Node 22.15+; older Node writes a temp .mjs file instead
	// ###################
	hooked = typeof module.registerHooks === "function";
	if (hooked) {
		module.registerHooks({
			resolve: (specifier, context, next) => (sources.has(specifier) ? { url: specifier, shortCircuit: true } : next(specifier, context)),
			load: (url, context, next) => (sources.has(url) ? { format: "module", source: sources.get(url), shortCircuit: true } : next(url, context))
		});
	}
	return hooked;
};

// ###################
// Run in this thread (the worker calls this)
// ###################
export function evaluateInThread(graph, options = {}) {
	const cwd = options.cwd ?? process.cwd();

	// ###################
	// The module's URL sits next to the .arcm file, so npm packages resolve from there
	// ###################
	const importModule = async (code, id) => {
		const dir = isAbsolute(id) ? dirname(id) : cwd;
		const hash = createHash("sha1").update(id + code).digest("hex").slice(0, 12);
		const file = join(dir, `.arcm-${hash}.mjs`);
		const href = pathToFileURL(file).href;
		const virtual = hook();

		if (virtual) sources.set(href, code);
		else await writeFile(file, code);
		try {
			return { render: (await import(href)).default, keys: [href, file] };
		} catch (err) {
			const pkg = /Cannot find package '([^']+)'/.exec(err.message);
			const mod = /Cannot find module '([^']+)'/.exec(err.message);
			if (pkg) throw new EvaluatorError(`can't find package "${pkg[1]}"; run npm install ${pkg[1]}`, id, null, err);
			if (mod) throw new EvaluatorError(`can't find file "${mod[1]}"`, id, null, err);
			throw err;
		} finally {
			if (!virtual) await unlink(file).catch(() => {});
		}
	};

	return evaluateCore(graph, { ...options, importModule });
}

// ###################
// An error from the worker, as the same kind of error here
// ###################
const revive = (e) => {
	const err = e.name === "EvaluatorError" ? Object.create(EvaluatorError.prototype) : new Error(e.message);
	return Object.assign(err, { name: e.name, message: e.message, source: e.source, position: e.position, stack: e.stack ?? err.stack });
};

// ###################
// A build worker: one thread, used for one page at a time. On timeout it is
// terminated (loops, timers and pending work stop) and a new one starts next time
// ###################
export class BuildWorker {
	#worker = null;
	#next = 0;

	#start() {
		if (this.#worker) return this.#worker;
		// ###################
		// Node's flags carry over, except those only for code given on the command line
		// ###################
		const execArgv = process.execArgv.filter((a) => !/^--(input-type|eval|print)(=|$)/.test(a) && a !== "-e" && a !== "-p");
		const worker = new Worker(new URL("./eval-worker.js", import.meta.url), { execArgv });
		// ###################
		// Between pages, a leftover timer may throw or exit: drop that worker, never crash the build
		// ###################
		const drop = () => {
			if (this.#worker === worker) this.#worker = null;
		};
		worker.on("error", drop);
		worker.on("exit", drop);
		worker.unref();
		this.#worker = worker;
		return worker;
	}

	run(graph, options = {}) {
		const { timeout = 5000, props = {}, removeComments = true, version, cwd } = options;
		const worker = this.#start();
		const id = this.#next++;
		let running = graph.entry;

		return new Promise((resolve, reject) => {
			let timer = null;
			const done = () => {
				clearTimeout(timer);
				worker.off("message", onMessage);
				worker.off("error", onError);
				worker.off("exit", onExit);
				worker.unref();
			};
			const onMessage = (m) => {
				if (m.id !== id) return;
				if (m.running) {
					running = m.running;
					return;
				}
				done();
				if (m.error) reject(revive(m.error));
				else resolve(m.result);
			};
			const onError = (err) => {
				done();
				this.#worker = null;
				reject(new EvaluatorError(`\${ }$ code failed outside the page: ${err?.message ?? err}`, running));
			};
			const onExit = () => {
				done();
				this.#worker = null;
				reject(new EvaluatorError("${ }$ code ended the build worker (process.exit?)", running));
			};

			worker.on("message", onMessage);
			worker.on("error", onError);
			worker.on("exit", onExit);
			worker.ref();

			if (timeout) {
				timer = setTimeout(() => {
					done();
					this.close();
					reject(new EvaluatorError(`\${ }$ code took longer than ${timeout} ms and was stopped`, running));
				}, timeout);
			}

			try {
				worker.postMessage({ id, graph, options: { props, removeComments, version, cwd } });
			} catch (err) {
				done();
				reject(new EvaluatorError(`page props must be plain data (text, numbers, arrays, objects, Date, Map, Set): ${err.message}`, graph.entry));
			}
		});
	}

	// ###################
	// Stop the thread: anything still running in it (timers too) stops
	// ###################
	close() {
		const worker = this.#worker;
		this.#worker = null;
		if (worker) {
			worker.removeAllListeners("exit");
			worker.terminate();
		}
	}
}

// ###################
// One worker for the process: starting a thread and loading the compiler costs ~150 ms, so it's
// paid once. An idle worker never keeps Node running; a timeout replaces it with a fresh one
// ###################
let shared = null;
export const sharedWorker = () => (shared ??= new BuildWorker());

export default function evaluate(graph, options = {}) {
	return (options.worker ?? sharedWorker()).run(graph, options);
}
