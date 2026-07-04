import { rollup } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { writeFileSync } from "node:fs";

const bundle = await rollup({
    input: "entries/pathe.js",
    plugins: [nodeResolve()],
});

const { output } = await bundle.generate({ format: "es" });
const code = output[0].code;
await bundle.close();

writeFileSync(
    "core/pathe-bundle.js",
    `export const patheBundleCode = ${JSON.stringify(code)};\n`
);
