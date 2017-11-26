// IMPORTS
const debug = require('debug')('module:servers');
const http = require('http');
const https = require('https');
const Module = require('./module');

// IMPLEMENTATION
class Servers extends Module {
    constructor(application) {
        debug('Module creation...');
        super(application);
        this.config = this.application.config['servers'];
        if ((!this.config['http'] || !this.config['http']['port']) && (!this.config['https'] || !this.config['https']['port'])) {
            throw new Error('Cannot create server without any configuration!');
        }
        this.http = null;
        this.https = null;
        debug('...module created.');
    }

    init() {
        debug('Module initialization...');
        let startingServers = [];
        this.application.log('Starting servers...');
        if (this.config['http'] && this.config['http']['port']) {
            this.application.log(` * [http] server starting on port ${this.config['http']['port']} with host ${this.config['http']['host'] || '*'}`);
            this.http = http.createServer(this.application.requestsListener);
            this.http.application = this.application;
            startingServers.push(
                new Promise((resolve) => {
                    this.http.listen(this.config['http']['port'], this.config['http']['host'], () => {
                        this.application.log(`    > [http] server started on port ${this.http.address().port} with address ${this.http.address().address} (${this.http.address().family})`);
                        return resolve(this.http);
                    });
                })
            );
        }
        if (this.config['https'] && this.config['https']['port']) {
            let certs = this.config['https']['certs'];
            if (!certs['key'] || !certs['cert']) {
                this.application.error(new Error('Cannot start https server without any certs data!'));
            } else {
                startingServers.push(
                    this.application.modules.security.getSecurityCerts(certs)
                        .then((data) => {
                            if (data.key && data.cert) {
                                this.application.log(` * [https] server starting on port ${this.config['https']['port']} with host ${this.config['https']['host'] || '*'}`);
                                this.https = https.createServer(data, this.application.requestsListener);
                                this.https.application = this.application;
                                this.https.listen(this.config['https']['port'], this.config['https']['host'], () => {
                                    this.application.log(`    > [https] server started on port ${this.https.address().port} with address ${this.https.address().address} (${this.https.address().family})`);
                                    return this.https;
                                });
                            } else {
                                this.application.error(new Error('Cannot load certs data to start https server!'));
                            }
                        })
                        .catch((error) => {
                            throw error;
                        })
                );
            }
        }
        if (startingServers.length > 0) {
            return Promise.all(startingServers)
                .then(() => {
                    this.application.log('...servers started.');
                    debug('...module initialized.');
                })
                .catch((error) => {
                    throw error;
                });
        }
        this.application.log('...nothing to start.');
        debug('...module initialized.');
        return Promise.resolve();
    }
}

// EXPORTS
module.exports = Servers;