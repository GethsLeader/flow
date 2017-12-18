// IMPORTS
const debug = require('debug')('module:logger');
const rfs = require('rotating-file-stream');
const path = require('path');
const moment = require('moment');
const morgan = require('morgan');
const winston = require('winston');
const Module = require('./module');

// IMPLEMENTATION
class Rotation {
    constructor(interval, size) {
        this.interval = interval;
        this.size = size;
    }
}

class Streams {
    constructor(general, access, errors, warnings) {
        this.general = general;
        this.access = access;
        this.errors = errors;
        this.warnings = warnings;
    }
}

Streams.generalLogFileName = 'general.log';
Streams.accessLogFileName = 'access.log';
Streams.errorsLogFileName = 'errors.log';
Streams.warningsLogFileName = 'warnings.log';

class Channels {
    constructor() {
        this.console = null;
        this.general = null;
        this.errors = null;
        this.warnings = null;
    }
}

class Logger extends Module {
    constructor(application) {
        debug('Module creation...');
        super(application);
        this.config = this.application.config['logger'];
        this.path = this.config['path'] || path.resolve(this.application.configurator.globalPath, 'logs');
        this.rotation = new Rotation(this.config['rotation']['interval'], this.config['rotation']['size']);
        debug('...module created.');
    }

    async init() {
        debug('Module initialization...');
        this.channels = new Channels();
        if (this.application.get('env') !== 'production') {
            this.application.use(morgan('dev'));
            this.channels.console = new (winston.Logger)({
                level: 'info',
                transports: [
                    new (winston.transports.Console)({
                        timestamp: () => {
                            return moment().format('YYYY-MM-DD HH:mm:ss')
                        },
                        colorize: true
                    })
                ]
            });
            this.channels.general = this.channels.console;
            this.channels.warnings = this.channels.console;
            this.channels.errors = this.channels.console;
        } else {
            this.streams = new Streams(
                rfs(Streams.generalLogFileName, {
                    path: this.path,
                    interval: this.rotation.interval,
                    size: this.rotation.size,
                    compress: 'gzip'
                }),
                rfs(Streams.accessLogFileName, {
                    path: this.path,
                    interval: this.rotation.interval,
                    size: this.rotation.size,
                    compress: 'gzip'
                }),
                rfs(Streams.errorsLogFileName, {
                    path: this.path,
                    interval: this.rotation.interval,
                    size: this.rotation.size,
                    compress: 'gzip'
                }),
                rfs(Streams.warningsLogFileName, {
                    path: this.path,
                    interval: this.rotation.interval,
                    size: this.rotation.size,
                    compress: 'gzip'
                })
            );
            this.application.use(morgan('common', {
                stream: this.streams.access,
                skip: (req, res) => {
                    return res.statusCode >= 400;
                }
            }));
            this.application.use(morgan('common', {
                stream: this.streams.errors,
                skip: (req, res) => {
                    return res.statusCode < 400;
                }
            }));
            this.channels.console = new (winston.Logger)({
                level: 'info',
                transports: [
                    new (winston.transports.Console)({
                        timestamp: () => {
                            return moment().format('YYYY-MM-DD HH:mm:ss')
                        },
                        colorize: true
                    })
                ]
            });
            this.channels.general = new (winston.Logger)({
                level: 'info',
                transports: [
                    new (winston.transports.File)({
                        stream: this.streams.general,
                        timestamp: () => {
                            return moment().format('YYYY-MM-DD HH:mm:ss')
                        },
                        colorize: false
                    })
                ]
            });
            this.channels.errors = new (winston.Logger)({
                level: 'error',
                transports: [
                    new (winston.transports.File)({
                        stream: this.streams.errors,
                        timestamp: () => {
                            return moment().format('YYYY-MM-DD HH:mm:ss')
                        },
                        colorize: false
                    })
                ]
            });
            this.channels.warnings = new (winston.Logger)({
                level: 'warn',
                transports: [
                    new (winston.transports.File)({
                        stream: this.streams.warnings,
                        timestamp: () => {
                            return moment().format('YYYY-MM-DD HH:mm:ss')
                        },
                        colorize: false
                    })
                ]
            });
        }
        this.application.log = this.log.bind(this, 'log');
        this.application.info = this.log.bind(this, 'info');
        this.application.warn = this.log.bind(this, 'warn');
        this.application.error = this.log.bind(this, 'error');
        debug('...module initialized.');
        return this;
    }

    log(firstArgument, ...args) {
        let logger = this.channels.general;
        switch (firstArgument) {
            case 'warn':
                logger = this.channels.warnings;
                break;
            case 'error':
                logger = this.channels.errors;
                break;
            case 'log':
            case 'info':
            default:
                firstArgument = 'info';
        }
        if (logger !== this.channels.console) {
            this.channels.console[firstArgument].apply(this.channels.console, args);
        }
        logger[firstArgument].apply(logger, args);
    }
}

// EXPORTS
module.exports = Logger;