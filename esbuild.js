import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const asyncHooksShim = resolve(__dirname, "async-hooks.js");

/**
 * esbuild plugin for SomMark.
 * Redirects `node:async_hooks` to a browser-compatible shim.
 *
 * @example
 * // esbuild.config.mjs
 * import { sommarkEsbuild } from "sommark/esbuild";
 * await esbuild.build({ plugins: [sommarkEsbuild()] });
 */
export function sommarkEsbuild() {
  return {
    name: "sommark",
    setup(build) {
      build.onResolve({ filter: /^node:async_hooks$/ }, () => ({
        path: asyncHooksShim,
      }));
    },
  };
}
