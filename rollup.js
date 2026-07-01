import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const asyncHooksShim = resolve(__dirname, "async-hooks.js");

/**
 * Rollup plugin for SomMark.
 * Resolves `node:async_hooks` to a browser-compatible shim.
 *
 * @example
 * // rollup.config.js
 * import { sommarkRollup } from "sommark/rollup";
 * export default { plugins: [sommarkRollup(), commonjs(), nodeResolve({ browser: true })] };
 */
export function sommarkRollup() {
  return {
    name: "sommark",
    options(opts) {
      const prev = opts.treeshake;
      return {
        ...opts,
        treeshake: {
          ...(prev && typeof prev === "object" ? prev : {}),
          moduleSideEffects(id, external) {
            // quickjs-emscripten uses side-effectful env/importObject setup that
            // tree-shaking removes incorrectly without this guard
            if (id.includes("quickjs") || id.includes("@jitl/")) return true;
            const fn = prev?.moduleSideEffects;
            return typeof fn === "function" ? fn(id, external) : (fn ?? true);
          },
        },
      };
    },
    resolveId(id) {
      if (id === "node:async_hooks") return asyncHooksShim;
    },
  };
}
