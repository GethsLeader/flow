// IMPORTS
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// CONFIGURATOR
class Configurator {
    constructor() {
        this.appPath = process.cwd();
        this.globalPath = path.resolve(this.appPath, '..');
        this.packagePath = path.resolve(this.globalPath, 'package.json');
        this.defaultPath = path.resolve(this.globalPath, 'default.json');
        this.configPath = path.resolve(this.globalPath, 'config.json');
        this.package = null;
        this.config = null;
        this.loadPackage();
        this.loadConfig();
        this.versionHash = this._hashVersion();
    }

    _hashVersion() {
        const hmac = crypto.createHmac('sha256', this.package.name);
        hmac.update(this.package.version);
        return hmac.digest('hex');
    }

    savePackage() {
        try {
            fs.writeFileSync(this.packagePath, JSON.stringify(this.package, null, 2));
        } catch (error) {
            throw new Error(`Cannot save ${this.packagePath} file!`);
        }
    }

    saveConfig() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
        } catch (error) {
            throw new Error(`Cannot save ${this.configPath} file!`);
        }
    }

    loadPackage() {
        if (!fs.existsSync(this.packagePath)) {
            throw new Error(`Cannot find ${this.packagePath} file!`);
        }
        try {
            this.package = JSON.parse(fs.readFileSync(this.packagePath));
        } catch (error) {
            throw new Error(`Cannot read ${this.packagePath}!`);
        }
    }

    loadConfig() {
        if (!fs.existsSync(this.configPath)) {
            if (!fs.existsSync(this.defaultPath)) {
                throw new Error(`Cannot find ${this.defaultPath} file!`);
            }
            try {
                this.config = JSON.parse(fs.readFileSync(this.defaultPath));
            } catch (error) {
                throw new Error(`Cannot read ${this.defaultPath}!`);
            }
            try {
                fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
            } catch (error) {
                throw new Error(`Cannot write ${this.configPath}!`);
            }
        }
        try {
            this.config = JSON.parse(fs.readFileSync(this.configPath));
        } catch (error) {
            throw new Error(`Cannot read ${this.configPath}!`);
        }
    }
}

// EXPORTS
module.exports = Configurator;