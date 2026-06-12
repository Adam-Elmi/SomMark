import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import nodePath from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = nodePath.dirname(fileURLToPath(import.meta.url));
const EVALUATOR_STUB = nodePath.resolve(__dirname, "core/evaluator.stub.js");

// Redirects any import of evaluator.js to the stub — no QuickJS, no WASM pulled in
function stubEvaluator() {
    return {
        name: "stub-evaluator",
        resolveId(id, importer) {
            if (!importer) return null;
            const isEvaluator =
                id === "./evaluator.js" && importer.includes(`core${nodePath.sep}`) ||
                nodePath.resolve(nodePath.dirname(importer), id) ===
                    nodePath.resolve(__dirname, "core/evaluator.js");
            return isEvaluator ? EVALUATOR_STUB : null;
        },
    };
}

export default {
    input: "index.browser.js",
    output: {
        file: "dist/sommark.browser.lite.js",
        format: "es",
    },
    plugins: [
        stubEvaluator(),
        commonjs(),
        nodeResolve({ browser: true }),
    ],
};
