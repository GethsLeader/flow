// IMPORTS
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

// PLUGINS
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSWebpackPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// CONSTANTS
/**
 * Destination path for bundled sources (distributable)
 * @type {string}
 */
const distPath = path.resolve(__dirname, './frontend/dist');
/**
 * Sources path
 * @type {string}
 */
const srcPath = path.resolve(__dirname, './frontend/src');

/**
 * package.json file of project in JSON format
 * @type {{name: string, version: string, description: string, author: string, license: string}}
 */
const packageJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json')));

/**
 * Environment variable to detect production mode
 * @type {boolean}
 */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Environment variable to detect development mode
 * @type {boolean}
 */
const isDevelopment = process.env.NODE_ENV === 'development' || !isProduction;

/**
 * Variable to detect start webpack configuration via webpack dev server
 * @type {boolean}
 */
const isDevOrAppServer = process.argv.find((item) => {
    return item.includes('webpack-dev-server') || item.includes('run');
});

// CONFIGURATION
/**
 * configuration to manage SASS files and extract CSS in production mode
 * @type {Object}
 */
const extractSass = new ExtractTextPlugin({
    filename: 'styles/[name].[hash].css',
    disable: isDevelopment, // specially for use style-loader in development mode
});

/**
 * Basic webpack configuration declaration
 * @type {Object}
 */
const config = {
    entry: {
        application: path.resolve(srcPath, 'application/index.js') // main entry point, core of frontend application
    },
    output: {
        path: distPath,
        filename: '[name].[hash].js', // how bundled entry point will be named
    },
    devtool: isDevelopment ? 'inline-source-map' : false,
    module: {
        rules: [
            {test: /\.(md|txt)$/i, use: 'raw-loader'}, // turn imported md and txt files with 'raw-loader'
            {                                         // mean: 'put content directly into code'
                test: /\.(sass|scss)$/i,
                use: extractSass.extract // play around with sass files to css and after all -
                ({                       // extract it at production case
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: isDevelopment, // with sourceMaps in development
                                sourceMapContents: isDevelopment,
                                minimize: isProduction, // minify css in production
                                outputPath: 'styles/'
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: isDevelopment, // with sourceMaps in development
                                sourceMapContents: isDevelopment,
                            }
                        }
                    ],
                    fallback: 'style-loader', // will fire when extractSass will disabled by development mode
                    publicPath: '../' // move one step upper for normal relative paths resolving
                })
            },
            {
                test: /\.(html)$/i,
                use: {
                    loader: 'html-loader',
                    options: {}
                }
            },
            {
                test: /\.js$/i,
                exclude: /node_modules/, // should not babelify external dependencies
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false, // depend only for webpack configuration
                        presets: [
                            ['env', {
                                targets: {
                                    browsers: '> 1%', // for 'all' browsers support
                                },
                                modules: false
                            }]
                        ]
                    }
                }
            },
            {
                test: /\.(svg|jpe?g|png|gif|ico)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[hash].[ext]',
                            outputPath: 'images/'
                        }
                    }
                ]
            },
            {
                test: /\.(ttf|eot|woff|woff2)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[hash].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        extractSass,
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: (module) => {
                return module.context && module.context.indexOf('node_modules') !== -1;
            }
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': isProduction ? '"production"' : '"development"',
            application: {
                isProduction: JSON.stringify(isProduction),
                isDevelopment: JSON.stringify(isDevelopment),
                info: {
                    name: JSON.stringify(packageJSON.name),
                    version: JSON.stringify(packageJSON.version),
                    author: JSON.stringify(packageJSON.author),
                    description: JSON.stringify(packageJSON.description),
                    license: JSON.stringify(packageJSON.license)
                }
            }
        })
    ],
    resolve: {
        modules: ['node_modules', srcPath], // webpack should to resolve files for import there
        alias: { // vue support
            'vue$': 'vue/dist/vue.esm.js'
        }
    }
};

let webpackHtmlPluginOptions = {
    template: path.resolve(srcPath, 'application/index.ejs'),
    title: `${packageJSON.name.charAt(0).toUpperCase() + packageJSON.name.slice(1)}${packageJSON.version ? ' ' + packageJSON.version : ''}`,
    chunks: ['vendor', 'application'],
    filename: 'index.html',
    minify: false
};

if (!isDevOrAppServer) { // no need to clean dist directory on simple build call
    config.plugins.unshift(new CleanWebpackPlugin(distPath));
}

if (isDevelopment && isDevOrAppServer) { // in this case here should be HMR support
    config.output.publicPath = '/';
    config.entry.hmr = 'webpack-hot-middleware/client';
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    webpackHtmlPluginOptions.chunks.push('hmr'); // HMR support for frontend, when on dev server
}

if (isProduction) {
    config.plugins.push(new UglifyJSWebpackPlugin({ // minify JS in production + tree shaking
        test: /\.js$/i
    }));

    webpackHtmlPluginOptions.minify = { // minify HTML in production
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
        useShortDoctype: true
    };

    config.plugins.push(new BundleAnalyzerPlugin()); // it's should help to check bundle after build
}

config.plugins.unshift(new HtmlWebpackPlugin(webpackHtmlPluginOptions));

// EXPORTS
/**
 * Export configurations
 * @type {Object}
 */
module.exports = Object.assign({}, config);