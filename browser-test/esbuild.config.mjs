import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, cpSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { sommarkEsbuild } from "sommark/esbuild";

const isWatch = process.argv.includes("--watch");
const outdir = "dist-esbuild";

// esbuild's loader:{ '.wasm': 'file' } only handles direct imports, not new URL() patterns
// in pre-minified npm packages (like quickjs-emscripten's emscripten-module.browser.mjs).
// This plugin intercepts those modules, rewrites the URL to a hashed filename,
// and copies the .wasm file to outdir on each build.
function wasmAssets() {
    const collected = new Map(); // absolute wasm path -> { name, content }

    return {
        name: "wasm-assets",
        setup(build) {
            build.onStart(() => collected.clear());

            build.onLoad({ filter: /emscripten-module(\.browser)?\.m?js$/ }, (args) => {
                const source = readFileSync(args.path, "utf8");
                const dir = dirname(args.path);

                const pattern = /new URL\(['"]([^'"]+\.wasm)['"]\s*,\s*import\.meta\.url\)/g;
                let result = source;
                let match;

                while ((match = pattern.exec(source)) !== null) {
                    const [full, wasmFile] = match;
                    const wasmPath = join(dir, wasmFile);
                    if (!existsSync(wasmPath)) continue;

                    let outputName;
                    if (collected.has(wasmPath)) {
                        outputName = collected.get(wasmPath).name;
                    } else {
                        const content = readFileSync(wasmPath);
                        const hash = createHash("sha256").update(content).digest("hex").slice(0, 8);
                        outputName = `emscripten-module-${hash}.wasm`;
                        collected.set(wasmPath, { name: outputName, content });
                    }

                    // All chunks are flat in outdir, so ./name resolves correctly
                    result = result.replace(full, `new URL("./${outputName}", import.meta.url)`);
                }

                return result !== source ? { contents: result, loader: "js" } : undefined;
            });

            build.onEnd(({ errors }) => {
                if (errors.length > 0) return;
                for (const { name, content } of collected.values()) {
                    writeFileSync(join(build.initialOptions.outdir, name), content);
                }
            });
        },
    };
}

// Copies index.html and templates into outdir after each successful build.
// No HTML patching needed — esbuild preserves the entry filename (main.js).
function copyStaticFiles() {
    return {
        name: "copy-static-files",
        setup(build) {
            build.onEnd(({ errors }) => {
                if (errors.length > 0) return;
                writeFileSync(join(outdir, "index.html"), readFileSync("index.html"));
                cpSync("public", join(outdir, "public"), { recursive: true });
                cpSync("templates", join(outdir, "templates"), { recursive: true });
            });
        },
    };
}

const config = {
    entryPoints: ["main.js"],
    bundle: true,
    format: "esm",
    target: "esnext",
    outdir,
    splitting: true,
    chunkNames: "[name]-[hash]",
    assetNames: "[name]-[hash]",
    platform: "browser",
    plugins: [sommarkEsbuild(), wasmAssets(), copyStaticFiles()],
};

if (isWatch) {
    const ctx = await esbuild.context(config);
    await ctx.watch();
    const { port } = await ctx.serve({ servedir: outdir, host: "localhost", port: 3002 });
    console.log(`esbuild dev server: http://localhost:${port}`);
} else {
    await esbuild.build(config);
}
