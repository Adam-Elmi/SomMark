import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { readFileSync, existsSync } from "node:fs";
import nodePath from "node:path";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import { sommarkRollup } from "sommark/rollup";

const isWatch = process.env.ROLLUP_WATCH === "true";

// Emit dist-rollup/index.html with the correct bundle.js script reference
function htmlPlugin() {
    return {
        name: "html",
        generateBundle() {
            this.emitFile({
                type: "asset",
                fileName: "index.html",
                source: readFileSync("index.html", "utf8").replace(
                    'src="./main.js"',
                    'src="./bundle.js"'
                ),
            });
        },
    };
}

// Rollup doesn't auto-copy .wasm files referenced via new URL('*.wasm', import.meta.url).
// This plugin detects those references during transform, emits the .wasm as an asset,
// and rewrites the URL to point to the emitted asset.
function wasmAssets() {
    let emitted = new Map(); // absolute wasm path -> refId

    return {
        name: "wasm-assets",
        buildStart() {
            emitted = new Map(); // reset per build (important in watch mode)
        },
        transform(code, id) {
            if (!code.includes(".wasm")) return null;

            const dir = nodePath.dirname(id);
            let changed = false;
            let result = code;

            const pattern = /new URL\(['"]([^'"]+\.wasm)['"]\s*,\s*import\.meta\.url\)/g;
            let match;
            while ((match = pattern.exec(code)) !== null) {
                const [full, wasmFile] = match;
                const wasmPath = nodePath.resolve(dir, wasmFile);
                if (!existsSync(wasmPath)) continue;

                let refId;
                if (emitted.has(wasmPath)) {
                    refId = emitted.get(wasmPath);
                } else {
                    const source = readFileSync(wasmPath);
                    refId = this.emitFile({ type: "asset", name: nodePath.basename(wasmPath), source });
                    emitted.set(wasmPath, refId);
                }

                result = result.replace(
                    full,
                    `new URL(import.meta.ROLLUP_FILE_URL_${refId}, import.meta.url)`
                );
                changed = true;
            }

            return changed ? { code: result, map: null } : null;
        },
    };
}

export default {
    input: "main.js",
    output: {
        dir: "dist-rollup",
        format: "es",
        entryFileNames: "bundle.js",
        chunkFileNames: "[name]-[hash].js",
    },
    plugins: [
        sommarkRollup(),
        commonjs(),
        nodeResolve({ browser: true }),
        wasmAssets(),
        htmlPlugin(),
        isWatch && serve({
            contentBase: ["dist-rollup", "public", "."],
            port: 3001,
            open: true,
        }),
        isWatch && livereload("dist-rollup"),
    ].filter(Boolean),
};
