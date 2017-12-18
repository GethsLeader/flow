#!/usr/bin/env node

// IMPORTS
const debug = require('debug')('app');

// CONFIGURATION
debug('Process launched in:', process.cwd());
if (process.cwd() !== __dirname) {
    debug('Changing working directory to:', __dirname);
    process.chdir(__dirname);
}

// CONFIGURATION
const Configurator = require('./modules/configurator');
const configurator = new Configurator();

// APPLICATION
const Application = require('./modules/application');
const application = new Application(configurator);

(async () => {
    debug('Starting...');
    try {
        await application.start();
        debug('...started!');
        application.log(`Application "${application.package.name}" (${application.package.version}) successful launched!`);
    } catch (error) {
        application.error(error);
    }
})();