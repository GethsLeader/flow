// IMPORTS
const debug = require('debug')('module:webpack-injection');
const webpack = require('webpack');
const WebpackDevMiddleware = require('webpack-dev-middleware');
const WebpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('../../webpack.config');
const Module = require('./module');

// IMPLEMENTATION
class WebpackInjection extends Module {
    constructor(application) {
        debug('Module creation...');
        super(application);
        this.inject = process.argv.includes('--webpack') || process.argv.includes('-w');
        if (this.inject) {
            debug('Webpack injection enabled!');
        }
        debug('...created.');
    }

    async webpackMiddlewareInitialization() {
        if (this.application.get('env') !== 'production') {
            // load and compile webpack configuration from project root
            debug('Frontend compilation...');
            const webpackCompiler = webpack(webpackConfig);
            // middleware apply
            const webpackDevMiddleware = WebpackDevMiddleware(webpackCompiler, {
                publicPath: webpackConfig.output.publicPath,
                contentBase: null, // where from should to serve all other application static files
                staticOptions: {}, // additional options to serve static files right
                historyApiFallback: null, // rewrite rules, in other words what serve on each request, will serve index.html on true
                compress: true, // gzip compression
                inline: true, // to prepare live scripts reloading
                hot: true, // to hot modules replacement feature
                watchOptions: {}, // options to handle file system changes notifications right
                stats: { // option to control information output about bundle
                    colors: true
                }
            });
            const webpackHotMiddleware = WebpackHotMiddleware(webpackCompiler);
            this.application.use(webpackDevMiddleware);
            this.application.use(webpackHotMiddleware);
            return new Promise((resolve) => {
                webpackDevMiddleware.waitUntilValid(() => {
                    debug('...compiled.');
                    resolve();
                });
            });
        }
    }

    async init() {
        debug('Module initialization...');
        if (this.inject) {
            try {
                await this.webpackMiddlewareInitialization();
                this.application.log(`* Webpack injection done...`);
            } catch (error) {
                this.application.error(error);
            }
        }
        debug('...initialized');
        return this;
    }
}

// EXPORTS
module.exports = WebpackInjection;