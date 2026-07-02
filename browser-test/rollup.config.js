import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { readFileSync } from "node:fs";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import { sommarkRollup } from "sommark/rollup";

const isWatch = process.env.ROLLUP_WATCH === "true";

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
        htmlPlugin(),
        isWatch && serve({
            contentBase: ["dist-rollup", "public", "."],
            port: 3001,
            open: true,
        }),
        isWatch && livereload("dist-rollup"),
    ].filter(Boolean),
};
