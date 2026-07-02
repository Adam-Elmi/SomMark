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
            // preprocessor.js does a dynamic import("node:fs") at runtime — stub it out
            fs: false,
        },
    },
    plugins: [
        // Webpack does not understand the node: URI scheme — strip it so fallbacks apply
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
            resource.request = resource.request.replace(/^node:/, "");
        }),
        new HtmlWebpackPlugin({ template: "./index.html" }),
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
            { directory: path.resolve(__dirname, "public"), publicPath: "/public" },
        ],
        hot: true,
    },
};
