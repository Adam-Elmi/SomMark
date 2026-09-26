// ###################
// Node.js CSS build: bundle each page's CSS with esbuild
// Inline (CSS text per page) or files (assets/page-[hash].css); url() files copied with a hash
// ###################

import { dirname, isAbsolute, resolve } from "node:path";
import { existsSync } from "node:fs";
import { build } from "esbuild";
import { StyleError, inStyle } from "../core/css.js";

const ASSETS = ["png", "jpg", "jpeg", "gif", "svg", "webp", "avif", "ico", "bmp", "woff", "woff2", "ttf", "otf", "eot", "mp4", "webm", "mp3", "wav", "ogg"];
const LOADERS = Object.fromEntries(ASSETS.map((ext) => [`.${ext}`, "file"]));

// ###################
// Absolute path of a [link = href] file: "/x.css" is from the project root
// ###################
const filePath = (piece, cwd) =>
	piece.file.startsWith("/") ? resolve(cwd, `.${piece.file}`) : resolve(isAbsolute(piece.source ?? "") ? dirname(piece.source) : cwd, piece.file);

const dirOf = (piece, cwd) => (isAbsolute(piece.source ?? "") ? dirname(piece.source) : cwd);

// ###################
// Each page is one virtual entry that @imports its pieces in order
// ###################
const pluginFor = (pages, { cwd, copyAssets }) => ({
	name: "arcmoon-css",
	setup(b) {
		b.onResolve({ filter: /^arcm-css(-piece)?:/ }, (a) => ({ path: a.path, namespace: "arcm" }));
		b.onLoad({ filter: /^arcm-css:/, namespace: "arcm" }, (a) => {
			const p = Number(a.path.slice("arcm-css:".length));
			const contents = pages[p].pieces
				.map((piece, k) => `@import ${JSON.stringify(piece.file ? filePath(piece, cwd) : `arcm-css-piece:${p}:${k}`)};`)
				.join("\n");
			return { contents, loader: "css", resolveDir: cwd };
		});
		b.onLoad({ filter: /^arcm-css-piece:/, namespace: "arcm" }, (a) => {
			const [p, k] = a.path.slice("arcm-css-piece:".length).split(":").map(Number);
			const piece = pages[p].pieces[k];
			return { contents: piece.css, loader: "css", resolveDir: dirOf(piece, cwd) };
		});
		if (!copyAssets) b.onResolve({ filter: /.*/ }, (a) => (a.kind === "url-token" ? { path: a.path, external: true } : undefined));
	}
});

// ###################
// esbuild errors pointed at the [style] / [link] or the .css file
// ###################
const toError = (err, pages) => {
	const first = err.errors?.[0];
	if (!first) return err;
	const file = first.location?.file ?? "";
	const match = /arcm-css-piece:(\d+):(\d+)/.exec(file);
	if (match) {
		const piece = pages[Number(match[1])].pieces[Number(match[2])];
		return new StyleError(first.text, piece.source, inStyle(piece.position, first.location.line, first.location.column));
	}
	if (file && !file.startsWith("arcm")) {
		return new StyleError(first.text, resolve(file), { line: first.location.line - 1, character: first.location.column });
	}
	return new StyleError(first.text, "CSS bundle");
};

// ###################
// esbuild CSS warnings as { source, position, message, page }; page is null for .css files
// ###################
const toWarnings = (list, pages) =>
	list.map((w) => {
		const file = w.location?.file ?? "";
		const match = /arcm-css-piece:(\d+):(\d+)/.exec(file);
		if (match) {
			const piece = pages[Number(match[1])].pieces[Number(match[2])];
			return { source: piece.source, position: inStyle(piece.position, w.location.line, w.location.column), message: w.text, page: Number(match[1]) };
		}
		const position = w.location ? { line: w.location.line - 1, character: w.location.column } : null;
		return { source: file && !file.startsWith("arcm") ? resolve(file) : "CSS bundle", position, message: w.text, page: null };
	});

// ###################
// pages: [{ name, pieces }] (pieces from collectStyles)
// external: false → { css: Map(name → text), files: url() assets, warnings }
// external: true  → { entries: Map(name → css file path), files: css + url() assets, warnings }
// copyAssets: false leaves url() as written (compile() has nowhere to write files)
// ###################
export default async function bundleStyles(list, options = {}) {
	const { cwd = process.cwd(), outDir = cwd, assetsDir = "assets", external = false, copyAssets = true } = options;
	const pages = {};
	list.forEach((p, index) => {
		if (p.pieces.length) pages[index] = p;
	});
	const css = new Map();
	const entries = new Map();
	if (!Object.keys(pages).length) return { css, entries, files: [], warnings: [] };

	for (const { pieces } of Object.values(pages)) {
		for (const piece of pieces) {
			if (piece.file && !existsSync(filePath(piece, cwd))) throw new StyleError(`can't find stylesheet "${piece.file}"`, piece.source, piece.position);
		}
	}

	let out;
	try {
		out = await build({
			entryPoints: Object.keys(pages).map((i) => ({ in: `arcm-css:${i}`, out: list[i].name })),
			bundle: true,
			write: false,
			minify: true,
			logLevel: "silent",
			absWorkingDir: cwd,
			outdir: resolve(outDir),
			entryNames: external ? `${assetsDir}/[name]-[hash]` : "[name]",
			assetNames: `${assetsDir}/[name]-[hash]`,
			loader: LOADERS,
			mainFields: ["style", "main"],
			conditions: ["style"],
			metafile: true,
			plugins: [pluginFor(pages, { cwd, copyAssets })]
		});
	} catch (err) {
		throw toError(err, pages);
	}

	const byPath = new Map(out.outputFiles.map((f) => [f.path, f]));
	const entryFiles = new Set();
	for (const [file, meta] of Object.entries(out.metafile.outputs)) {
		const match = meta.entryPoint && /arcm-css:(\d+)/.exec(meta.entryPoint);
		if (!match) continue;
		const path = resolve(cwd, file);
		const name = list[Number(match[1])].name;
		if (external) entries.set(name, path);
		else {
			const text = byPath.get(path).text.trim();
			if (text) css.set(name, text);
			entryFiles.add(path);
		}
	}
	const files = out.outputFiles.filter((f) => !entryFiles.has(f.path)).map((f) => ({ path: f.path, contents: f.path.endsWith(".css") ? f.text : f.contents }));
	return { css, entries, files, warnings: toWarnings(out.warnings, pages) };
}
