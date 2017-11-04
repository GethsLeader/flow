/**
 * Class to divide application logs to few different levels with own visibility levels
 */
export class Logger {
    constructor(level) {
        this._levels = ['debug', 'info', 'log', 'warn', 'error'];
        this.level = level || 'log';
        this.debug('[Logger] constructed.');
    }

    set level(value) {
        this._level = value;
        this._enabled = this._levels.indexOf(this._level) >= 0;
    }

    get level() {
        return this._level;
    }

    _checkLevel(checkingLevel) {
        return this._levels.indexOf(checkingLevel) >= this._levels.indexOf(this._level);
    }

    debug() {
        if (this._enabled && this._checkLevel('debug')) {
            console.info.apply(console, arguments);
        }
    }

    info() {
        if (this._enabled && this._checkLevel('info')) {
            console.info.apply(console, arguments);
        }
    }

    log() {
        if (this._enabled && this._checkLevel('log')) {
            console.log.apply(console, arguments);
        }
    }

    warn() {
        if (this._enabled && this._checkLevel('warn')) {
            console.warn.apply(console, arguments);
        }
    }

    error() {
        if (this._enabled && this._checkLevel('error')) {
            console.error.apply(console, arguments);
        }
    }
}

/**
 * Singleton instance of Logger, to work with it in whole application
 * @type {Logger}
 */
export const logger = new Logger(application.isDevelopment ? 'debug' : 'log');