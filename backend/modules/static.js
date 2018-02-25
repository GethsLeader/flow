// IMPORTS
const debug = require('debug')('module:static');
const path = require('path');
const send = require('send');
const request = require('request');
const Module = require('./module');

// IMPLEMENTATION
class Static extends Module {
    constructor(application) {
        debug('Module creation...');
        super(application);
        this.config = this.application.config.static;
        debug('...created.');
    }

    async pass(url, req, res, next) {
        if (req.method !== 'GET') {
            return next();
        }
        try {
            let body = await new Promise((resolve, reject) => {
                request({
                    url: req.protocol + '://' + req.get('host') + url,
                    method: req.method,
                    headers: {
                        'User-Agent': req.headers['user-agent'],
                        'X-Forwarded-For': req.headers['x-forwarded-for'] || req.connection.remoteAddress
                    },
                    gzip: true
                }, (error, response, body) => {
                    if (error) {
                        return reject(error);
                    }
                    if (response.statusCode >= 400) {
                        return reject(new Error((response.statusText ? response.statusText : response.statusCode) + '\n' + body))
                    }
                    return resolve(body);
                });
            });
            return res.send(body);
        } catch (error) {
            this.application.error(error);
            return next();
        }
    }

    async filesMiddleware(req, res, next) {
        if (req.method !== 'GET') {
            return next();
        }
        let filePath = this.path + req.url,
            stream = send(req, filePath);
        stream.on('directory', () => {
            return next();
        });
        stream.on('error', () => {
            return next();
        });
        stream.pipe(res);
    }

    async proxyMiddleware(req, res, next) {
        if (req.method !== 'GET') {
            return next();
        }
        let url = this.proxy + req.url;
        if (!req.headers['x-forwarded-for']) {
            req.headers['x-forwarded-for'] = req.connection.remoteAddress;
        }
        let stream = request(
            {
                url: url,
                method: req.method,
                headers: req.headers
            }
        );
        stream.on('error', (error) => {
            this.application.error(error);
            return next();
        });
        stream.on('response', (response) => {
            if (response.statusCode >= 400) {
                return next();
            } else {
                stream.pipe(res);
            }
        });
    }

    async init() {
        debug('Module initialization...');
        if (this.config) {
            if (this.config.path) {
                this.path = path.resolve(__dirname + '/..', this.config.path);
                this.application.log(`* Static file path now is: ${this.path}`);
                this.application.use(this.filesMiddleware.bind(this));
            }
            if (this.config.proxy) {
                this.config.proxy = typeof this.config.proxy !== 'object' ? {} : this.config.proxy;
                this.config.proxy.protocol = this.config.proxy.protocol || 'http';
                this.config.proxy.host = this.config.proxy.host || 'localhost';
                this.config.proxy.port = this.config.proxy.port || 8000;
                this.proxy = this.config.proxy.protocol + '://' + this.config.proxy.host + ':' + this.config.proxy.port;
                this.application.log(`* Static proxy at: ${this.proxy}`);
                this.application.use(this.proxyMiddleware.bind(this));
            }
        }
        debug('...initialized');
        return this;
    }
}

// EXPORTS
module.exports = Static;