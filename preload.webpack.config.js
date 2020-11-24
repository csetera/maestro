const path = require('path');

/**
 * Webpack configuration that generates the Electron 
 * preload file that is injected into the web audio players.
 */
module.exports = {
    target: 'electron-preload',
    entry: {
        preload: './src/preload.ts',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        },
        extensions: ['.tsx', '.ts', '.js'],
    }, output: {
        path: path.resolve(__dirname, 'public/js'),
        filename: '[name].js'
    }
}
