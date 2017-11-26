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

    init() {
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
        return Promise.resolve(this);
    }

    _loadData(path) {
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

    getSecurityCerts(certsFiles) {
        debug('Trying to get security certs...');
        let certsData = new CertsData();
        let loadingFiles = [];
        if (certsFiles.key) {
            loadingFiles.push(
                this._loadData(certsFiles.key)
                    .then((data) => {
                        certsData.key = data;
                        debug('    * certs key loaded;');
                        return certsData.key;
                    })
                    .catch((error) => {
                        throw error;
                    })
            );
        }
        if (certsFiles.cert) {
            loadingFiles.push(
                this._loadData(certsFiles.cert)
                    .then((data) => {
                        certsData.cert = data;
                        debug('    * certs itself loaded;');
                        return certsData.cert;
                    })
                    .catch((error) => {
                        throw error;
                    })
            );
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
                                return certsData.ca[certsData.ca.length - 1];
                            })
                            .catch((error) => {
                                throw error;
                            })
                    );
                }
                loadingFiles.push(
                    Promise.all(loadingCAFiles)
                        .then(() => {
                            debug('    * certs ca loaded;');
                        })
                        .catch((error) => {
                            throw error;
                        })
                );
            }
        }
        if (loadingFiles.length > 0) {
            return Promise.all(loadingFiles)
                .then(() => {
                    debug('...security certs loading finished.');
                    return certsData;
                })
                .catch((error) => {
                    throw error;
                });
        }
        debug('...security certs loading skipped.');
        return Promise.resolve(certsData);
    }
}

// EXPORTS
module.exports = Security;