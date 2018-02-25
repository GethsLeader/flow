#!/usr/bin/env node

// IMPORTS
const http = require('http');
const express = require('express');
const webpack = require('webpack');
const WebpackDevMiddleware = require('webpack-dev-middleware');
const WebpackHotMiddleware = require('webpack-hot-middleware');

// CONFIGURATION
/**
 * Application dev server port
 * @type {number}
 */
const port = 8000;

/**
 * Application dev server host
 * @type {string}
 */
const host = 'localhost';

/**
 * Webpack configuration file path
 * @type {Object}
 */
const config = require('./webpack.config');

/**
 * Express application instance
 * @type {Object}
 */
const application = express();

/**
 * Webpack compiler instance - specially for use in webpack-dev-middleware further
 * @type {Object}
 */
const compiler = webpack(config);

// MIDDLEWARE
/**
 * Middleware instance to handle all dev server workflow
 * @type {function}
 */
const webpackDevMiddleware = WebpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
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

/**
 * Middleware to handle dev server HMR
 * @type {function}
 */
const webpackHotMiddleware = WebpackHotMiddleware(compiler);

/**
 * Error handler middleware for express application
 * @param err {Error} Error argument (should be null on state without any error)
 * @param req {Object} Request Incoming request from client to express application
 * @param res {Object} Response Outgoing answer from express application to client
 */
function errorsHandler(err, req, res, next) {
    res.status(err.status || 500); // if no error status, then it's should be server error with 500 status code
    if (err.status !== 404) { // do not show 404 errors in console, because it's little bit annoying
        console.error(err);
    }
    /**
     * Custom error object, specially to send to client application detailed information
     * @type {{status: number, message: string, stack: Array}}
     */
    let error = {
        status: err.status,
        message: err.message,
        stack: err.stack.split('\n')
    };
    if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) { // if XHR request case:
        return res.json(error); // custom error object should be send as raw json
    } else { // else output to client as html
        let html = '<h1>Error ' + error.status + '</h1><p style="color: #761c19">' + error.message + '</p>';
        html += error.stack.length ? '<h3>Stack:</h3>' : '<h4>Empty stack trace...</h4>';
        for (let i = 0; i < error.stack.length; i++) {
            html += '<p>' + error.stack[i] + '</p>';
        }
        return res.send(html);
    }
}

// SERVER
if (process.env.NODE_ENV === 'production') { // lets avoid case, when someone will start it in production
    throw new Error('Cannot use webpack-dev-server in production!');
}

application.use((req, res, next) => { // initial middleware
    res.header('X-Powered-By', 'Express + Webpack Development Server');
    return next();
});

application.use(webpackDevMiddleware); // middleware applying
application.use(webpackHotMiddleware);
application.use(errorsHandler);

/**
 * Dev server instance for express application
 * @type {Object}
 */
const devServer = http.createServer(application); // server preparing

// starting after compilation
console.log('Webpack compilation started...');
webpackDevMiddleware.waitUntilValid(() => {
    console.log('...compiled.');
    console.log(`Trying to start dev application server on port ${port} with host ${host ? host : '*'}`);
    devServer.listen(port, host, () => { // server starting
        console.log(`Dev application server created on port ${devServer.address().port} with address ${devServer.address().address} (${devServer.address().family})`);
    });
});