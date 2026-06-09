const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
    entry: "./main.js",
    output: {
        path: path.resolve(__dirname, "dist-webpack"),
        filename: "bundle.js",
        clean: true,
    },
    experiments: {
        asyncWebAssembly: true,
        topLevelAwait: true,
    },
    resolve: {
        fallback: {
            fs: false,
        },
    },
    plugins: [
        new HtmlWebpackPlugin({ template: "./index.html" }),
        // Webpack does not understand the node: URI scheme.
        // Strip the prefix so resolve.fallback.fs can stub it out.
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
            resource.request = resource.request.replace(/^node:/, "");
        }),
    ],
    module: {
        rules: [
            {
                test: /\.wasm$/,
                type: "asset/resource",
            },
        ],
    },
    devServer: {
        port: 3000,
        static: [
            { directory: path.resolve(__dirname, "templates"), publicPath: "/templates" },
            { directory: path.resolve(__dirname, "public"), publicPath: "/" },
        ],
        hot: true,
    },
};
