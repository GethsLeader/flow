// IMPORTS
const debug = require('debug')('module:routes');
const Module = require('./module');

// IMPLEMENTATION
class Routes extends Module {
    constructor(application) {
        debug('Module creation...');
        super(application);
        debug('...module created.');
    }

    async init() {
        debug('Module initialization...');
        this.application.use('/', require('../routes/index'));
        await this._webpackDevHandlers();
        this._errorsHandlers();
        debug('...module initialized.');
        return this;
    }

    async _webpackDevHandlers() {
        if (this.application.get('env') !== 'production') {
            // webpack imports
            const webpack = require('webpack');
            const WebpackDevMiddleware = require('webpack-dev-middleware');
            const WebpackHotMiddleware = require('webpack-hot-middleware');
            // load and compile webpack configuration from project root
            const webpackConfig = require('../../webpack.config');
            debug('Frontend compilation...');
            const webpackCompiler = webpack(webpackConfig);
            // middleware apply
            const webpackDevMiddleware = WebpackDevMiddleware(webpackCompiler, {
                publicPath: '/',
                contentBase: null, // where from should to serve all other application static files
                staticOptions: {}, // additional options to serve static files right
                historyApiFallback: null, // rewrite rules, in other words what serve on each request, will serve index.html on true
                compress: true, // gzip compression
                inline: true, // to prepare live scripts reloading
                hot: true, // to hot modules replacement feature
                watchOptions: {}, // options to handle file system changes notifications right
                stats: { // option to control information output about bundle
                    colors: true,
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

    _errorsHandlers() {
        // catch 404 and forward to error handler
        this.application.use((req, res, next) => {
            let error = new Error('ERROR_NOT_FOUND');
            error.status = 404;
            return next(error);
        });

        // development error handler
        // will print stacktrace
        if (this.application.get('env') !== 'production') {
            this.application.use((err, req, res, next) => {
                if (!err) {
                    err = new Error('ERROR_NO_MORE_LAYERS');
                }
                if (!err.message) {
                    err.message = 'ERROR_UNKNOWN'
                }
                if (err.message.indexOf('ERROR_') === 0 && !err.status) {
                    err.status = 403;
                }
                err.status = err.status || 500;
                res.status(err.status);
                if (err.status !== 404) {
                    this.application.error(err);
                }
                let error = {
                    status: err.status,
                    message: err.message,
                    stack: err.stack.split('\n')
                };
                if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') >= 0)) {
                    return res.json(error);
                } else {
                    let html = `<h1>Error ${error.status}</h1><p style="color: #761c19">${error.message}</p>`;
                    html += error.stack.length ? '<h3>Stack:</h3>' : '<h4>Empty stack trace...</h4>';
                    for (let i = 0; i < error.stack.length; i++) {
                        html += `<p>${error.stack[i]}</p>`;
                    }
                    return res.send(html);
                }
            });
        }

        // production error handler
        // no stacktrace leaked to user
        this.application.use((err, req, res, next) => {
            if (!err) {
                err = new Error('ERROR_NO_MORE_LAYERS');
            }
            if (!err.message) {
                err.message = 'ERROR_UNKNOWN'
            }
            if (err.message.indexOf('ERROR_') === 0 && !err.status) {
                err.status = 403;
            }
            err.status = err.status || 500;
            res.status(err.status);
            let error = {
                status: err.status,
                message: err.message
            };
            if (error.message.indexOf('ERROR_') !== 0) {
                error.message = 'ERROR_UNKNOWN';
                this.application.error(err);
            } else {
                this.application.error(`[${error.status}] ${error.message}`);
            }
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') >= 0)) {
                res.json(error);
            } else {
                if (err.status === 404) {
                    return res.send('<h1>404 PAGE PLACEHOLDER</h1>');
                } else {
                    let html = `<h1>Error ${error.status}</h1><p style="color: #761c19">${error.message}</p>`;
                    return res.send(html);
                }
            }
        });
    }
}

// EXPORTS
module.exports = Routes;