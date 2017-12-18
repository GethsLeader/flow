// IMPORTS
const debug = require('debug')('app:module');
const EventEmitter = require('events').EventEmitter;
const express = require('express');
const ExpressApplication = express.application;
const ExpressRequest = express.request;
const ExpressResponse = express.response;

const Logger = require('./logger');
const Security = require('./security');
const Routes = require('./routes');
const Servers = require('./servers');

// MODULES
class Modules {
    constructor(application) {
        debug('Modules creation...');
        this.logger = new Logger(application);
        this.security = new Security(application);
        this.routes = new Routes(application);
        this.servers = new Servers(application);
        debug('...modules created.');
    }
}

// IMPLEMENTATION
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
        this.modules = new Modules(this);
    }

    requestsListener(req, res, next) {
        this.application.handle(req, res, next);
    }

    async start() {
        await this.modules.logger.init();
        await this.modules.security.init();
        await this.modules.routes.init();
        await this.modules.servers.init();
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