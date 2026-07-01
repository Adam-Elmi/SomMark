import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const asyncHooksShim = resolve(__dirname, "async-hooks.js");

/**
 * Vite plugin for SomMark.
 * Aliases `node:async_hooks` to a browser-compatible shim so SomMark's
 * evaluator works in browser bundles without any manual config.
 *
 * @example
 * // vite.config.js
 * import { sommarkVite } from "sommark/vite";
 * export default defineConfig({ plugins: [sommarkVite()] });
 */
export function sommarkVite() {
  return {
    name: "sommark",
    config() {
      return {
        resolve: {
          alias: { "node:async_hooks": asyncHooksShim },
        },
        optimizeDeps: {
          exclude: ["quickjs-emscripten"],
        },
      };
    },
  };
}
