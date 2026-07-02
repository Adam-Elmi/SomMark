import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { sommarkRollup } from "./rollup.js";

export default {
    input: "index.browser.js",
    output: {
        dir: "dist",
        format: "es",
        entryFileNames: "sommark.browser.js",
        chunkFileNames: "[name]-[hash].js",
    },
    plugins: [
        sommarkRollup(),
        commonjs(),
        nodeResolve({ browser: true }),
    ],
};
