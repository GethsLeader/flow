// IMPORTS
const debug = require('debug')('app:module');
const EventEmitter = require('events').EventEmitter;
const express = require('express');
const ExpressApplication = express.application;
const ExpressRequest = express.request;
const ExpressResponse = express.response;

const Logger = require('./logger');

// MODULES
class Modules {
    constructor() {
        this.logger = null;
    }
}

// APPLICATION
class Application extends EventEmitter {
    constructor(configurator) {
        if (!configurator) {
            throw new Error('Cannot configure application without configurator instance!');
        }
        super();
        this.configurator = configurator;
        this.config = this.configurator.config;
        this.package = this.configurator.package;
        this.versionHash = this.configurator.versionHash;
        debug('Express application copying...');
        let keys = Object.keys(ExpressApplication);
        for (let i = 0; i < keys.length; i++) {
            this[keys[i]] = ExpressApplication[keys[i]];
        }
        this.request = Object.create(ExpressRequest, {
            app: {configurable: true, enumerable: true, writable: true, value: this}
        });
        this.response = Object.create(ExpressResponse, {
            app: {configurable: true, enumerable: true, writable: true, value: this}
        });
        debug('...express application copied.');
        debug('Application initialization...');
        this.init();
        debug('...application initialized.');
        debug('Modules creation...');
        this.modules = new Modules();
        this.logger = new Logger(this);
        debug('...modules created.');
    }

    requestsListener(req, res, next) {
        this.application.handle(req, res, next);
    }

    start() {
        return this.logger.init()
            .catch((error) => {
                throw error;
            });
    }

    log() {
        throw new Error(`Cannot call abstract method! Please, override it with own implementation.`)
    }

    info() {
        throw new Error(`Cannot call abstract method! Please, override it with own implementation.`)
    }

    warn() {
        throw new Error(`Cannot call abstract method! Please, override it with own implementation.`)
    }

    error() {
        throw new Error(`Cannot call abstract method! Please, override it with own implementation.`)
    }
}

// EXPORTS
module.exports = Application;