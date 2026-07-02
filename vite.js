/**
 * Vite plugin for SomMark.
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
        optimizeDeps: {
          exclude: ["quickjs-emscripten"],
        },
      };
    },
  };
}
