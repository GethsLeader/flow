// IMPORTS
const debug = require('debug')('module:security');
const fs = require('fs');
const helmet = require('helmet');
const Module = require('./module');

// IMPLEMENTATION
class CertsData {
    constructor() {
        this.key = null;
        this.cert = null;
        this.ca = null;
    }
}

class Security extends Module {
    constructor(application) {
        debug('Module creation...');
        super(application);
        this.config = this.application.config['security'] || {};
        debug('...module created.');
    }

    async init() {
        debug('Module initialization...');
        this.poweredBy = this.config['poweredBy'] || 'Django/1.2.1 SVN-13336';
        this.frameguard = this.config['frameguard'] ? this.config['frameguard']
            : this.config['frameguard'] === false ? false : 'sameorigin';
        this.xssFilter = this.config['xssFilter'] === true;
        this.application.use(helmet({
            hidePoweredBy: {
                setTo: this.poweredBy
            },
            frameguard: {
                action: this.frameguard
            },
            xssFilter: this.xssFilter
        }));
        debug('...module initialized.');
        return this;
    }

    async _loadData(path) {
        return new Promise((resolve, reject) => {
            fs.access(path, fs.constants.R_OK, (err) => {
                if (err) {
                    return reject(err);
                }
                fs.readFile(path, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(data);
                });
            })
        });
    }

    async getSecurityCerts(certsFiles) {
        debug('Trying to get security certs...');
        let loadingFiles = [],
            certsData = new CertsData();
        if (certsFiles.key) {
            certsData.key = await this._loadData(certsFiles.key);
            loadingFiles.push(certsData.key);
            debug('    * certs key loaded;');
        }
        if (certsFiles.cert) {
            certsData.cert = await this._loadData(certsFiles.cert);
            loadingFiles.push(certsData.cert);
            debug('    * certs itself loaded;');
        }
        if (certsFiles.ca) {
            if (certsFiles.ca && typeof certsFiles.ca === 'string') {
                certsFiles.ca = [certsFiles.ca];
            }
            if (certsFiles.ca.length > 0) {
                certsData.ca = [];
                let loadingCAFiles = [];
                for (let i = 0; i < certsFiles.ca.length; i++) {
                    loadingCAFiles.push(
                        this._loadData(certsFiles.ca[i])
                            .then((data) => {
                                certsData.ca.push(data);
                                return data;
                            })
                            .catch((error) => {
                                throw error;
                            })
                    );
                }
                loadingFiles = loadingFiles.concat(await Promise.all(loadingCAFiles));
                debug('    * certs ca loaded;');
            }
        }
        if (loadingFiles.length > 0) {
            debug('...security certs loading finished.');
        } else {
            debug('...security certs loading skipped.');
        }
        return certsData;
    }
}

// EXPORTS
module.exports = Security;