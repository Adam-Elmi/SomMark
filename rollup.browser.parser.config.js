import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import nodePath from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = nodePath.dirname(fileURLToPath(import.meta.url));
const EVALUATOR_STUB = nodePath.resolve(__dirname, "core/evaluator.stub.js");

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
    input: "entries/parser.js",
    output: {
        file: "dist/sommark.parser.js",
        format: "es",
    },
    plugins: [
        stubEvaluator(),
        commonjs(),
        nodeResolve({ browser: true }),
    ],
};
