const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { SomMarkWebpackPlugin } = require("sommark/webpack");

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
    plugins: [
        new SomMarkWebpackPlugin(),
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
