import { readFileSync, existsSync } from "node:fs";
import nodePath from "node:path";

/**
 * Rollup plugin for SomMark.
 *
 * Fixes two issues:
 * 1. Prevents Rollup from tree-shaking QuickJS modules (they have side effects
 *    that Rollup incorrectly marks as removable).
 * 2. Handles QuickJS WASM assets referenced via new URL("*.wasm", import.meta.url).
 *    Rollup does not copy or rewrite these automatically, so this plugin emits
 *    them as assets and rewrites the URLs to point to the output paths.
 *
 * @example
 * // rollup.config.js
 * import { sommarkRollup } from "sommark/rollup";
 * export default { plugins: [sommarkRollup(), commonjs(), nodeResolve({ browser: true })] };
 */
export function sommarkRollup() {
  let emitted = new Map();

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

    buildStart() {
      emitted = new Map();
    },

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

        result = result.replace(
          full,
          `new URL(import.meta.ROLLUP_FILE_URL_${refId}, import.meta.url)`
        );
        changed = true;
      }

      return changed ? { code: result, map: null } : null;
    },
  };
}
