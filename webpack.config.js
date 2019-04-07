const path = require('path');

module.exports = {
    entry: "./src/index.ts",
    output: {
        filename: "bundle.js"
    },
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: [".ts", '.js'],
        modules: ["node_modules"]
    },
    module: {
        rules: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            {
                test: /\.tsx?$/,
                //exclude: /node_modules/,
                loader: "ts-loader"
            }
        ]
    }
}