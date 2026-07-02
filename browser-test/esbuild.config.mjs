import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, cpSync } from "node:fs";
import { join } from "node:path";
import { sommarkEsbuild } from "sommark/esbuild";

const isWatch = process.argv.includes("--watch");
const outdir = "dist-esbuild";

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
    plugins: [sommarkEsbuild(), copyStaticFiles()],
};

if (isWatch) {
    const ctx = await esbuild.context(config);
    await ctx.watch();
    const { port } = await ctx.serve({ servedir: outdir, host: "localhost", port: 3002 });
    console.log(`esbuild dev server: http://localhost:${port}`);
} else {
    await esbuild.build(config);
}
