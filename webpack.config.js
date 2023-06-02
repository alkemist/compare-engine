// Generated using webpack-cli https://github.com/webpack/webpack-cli
const TerserPlugin = require('terser-webpack-plugin');


module.exports = {
    mode: "none",
    entry: "./src/index.ts",
    output: {
        path: __dirname + "/lib",
        filename: 'index.ts',
    },
    plugins: [],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            test: /\.ts(\?.*)?$/i,
            parallel: true,
            terserOptions: {},
        })],
    },
    module: {
        rules: [
            {
                test: /\.(ts)$/i,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts"],
    },
}