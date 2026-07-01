const path = require("path");
const shim = path.resolve(__dirname, "async-hooks.js");

/**
 * Webpack plugin for SomMark.
 * Wires up `node:async_hooks` → browser shim via resolve.alias + resolve.fallback.
 *
 * @example
 * // webpack.config.cjs
 * const { SomMarkWebpackPlugin } = require("sommark/webpack");
 * module.exports = { plugins: [new SomMarkWebpackPlugin()] };
 */
class SomMarkWebpackPlugin {
  apply(compiler) {
    compiler.hooks.afterEnvironment.tap("sommark-webpack", () => {
      const r = compiler.options.resolve;
      r.alias ??= {};
      r.alias["node:async_hooks"] = shim;
      r.fallback ??= {};
      r.fallback["async_hooks"] = shim;
      // Default fs to false — SomMark's browser entry doesn't use the filesystem
      r.fallback["fs"] ??= false;
    });

    // Webpack doesn't understand the node: URI scheme for built-ins; strip it so
    // the resolver can apply fallbacks for any remaining node: imports
    const { NormalModuleReplacementPlugin } = compiler.webpack;
    new NormalModuleReplacementPlugin(/^node:/, (resource) => {
      resource.request = resource.request.replace(/^node:/, "");
    }).apply(compiler);
  }
}

module.exports = { SomMarkWebpackPlugin };
