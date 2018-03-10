/**
 * Logger service class
 */
export class Logger {
    /**
     * @param level {string} Minimal level for logging. Default - log
     */
    constructor(level) {
        this._levels = ['debug', 'info', 'log', 'warn', 'error'];
        this.level = level || 'log';
        this._init();
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


    _init() {
        if (this._enabled) {
            if (this._checkLevel('debug')) {
                this.debug = console.log.bind(console);
            } else {
                this.debug = this._doNotLog.bind(this);
            }
            if (this._checkLevel('info')) {
                this.info = console.log.bind(console);
            } else {
                this.info = this._doNotLog.bind(this);
            }
            if (this._checkLevel('log')) {
                this.log = console.log.bind(console);
            } else {
                this.log = this._doNotLog.bind(this);
            }
            if (this._checkLevel('warn')) {
                this.warn = console.warn.bind(console);
            } else {
                this.warn = this._doNotLog.bind(this);
            }
            if (this._checkLevel('error')) {
                this.error = console.error.bind(console);
            } else {
                this.error = this._doNotLog.bind(this);
            }
        }

    }

    _doNotLog() {
    }
}

/**
 * Logger service instance
 * @type {Logger}
 */
export const logger = new Logger(application.isDevelopment ? 'debug' : 'log');