import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";

/**
 * esbuild plugin for SomMark.
 *
 * Handles QuickJS WASM assets that esbuild cannot process automatically.
 * QuickJS loads its .wasm files via `new URL("*.wasm", import.meta.url)`
 * inside pre-built package files. esbuild's file loader does not intercept
 * these patterns, so this plugin rewrites the URLs and copies the .wasm
 * files to the output directory.
 *
 * @example
 * // esbuild.config.mjs
 * import { sommarkEsbuild } from "sommark/esbuild";
 * await esbuild.build({ plugins: [sommarkEsbuild()] });
 */
export function sommarkEsbuild() {
  const collected = new Map();

  return {
    name: "sommark",
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
