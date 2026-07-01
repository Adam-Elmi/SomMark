import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { readFileSync, existsSync } from "node:fs";
import nodePath from "node:path";

// Emit WASM files as assets and rewrite new URL('*.wasm', import.meta.url) to
// point at the emitted asset — same approach used in browser-test/rollup.config.js.
function wasmAssets() {
    let emitted = new Map();
    return {
        name: "wasm-assets",
        buildStart() { emitted = new Map(); },
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
                result = result.replace(full, `new URL(import.meta.ROLLUP_FILE_URL_${refId}, import.meta.url)`);
                changed = true;
            }
            return changed ? { code: result, map: null } : null;
        },
    };
}

// Redirect node:async_hooks to the browser shim so the evaluator
// works in environments where Node built-ins are unavailable.
function asyncHooksShim() {
    const shimPath = nodePath.resolve("./async-hooks.js");
    return {
        name: "async-hooks-shim",
        resolveId(id) {
            if (id === "node:async_hooks") return shimPath;
            return null;
        },
    };
}

export default {
    input: "index.browser.js",
    output: {
        dir: "dist",
        format: "es",
        entryFileNames: "sommark.browser.js",
        chunkFileNames: "[name]-[hash].js",
    },
    treeshake: {
        moduleSideEffects: (id) => id.includes("quickjs") || id.includes("@jitl/"),
    },
    plugins: [
        asyncHooksShim(),
        commonjs(),
        nodeResolve({ browser: true }),
        wasmAssets(),
    ],
};
