// ABSTRACT IMPLEMENTATION
class Module {
    constructor(application) {
        if (this.constructor === Module) {
            throw new Error(`Cannot instantiate abstract ${this.constructor} class!`);
        }
        if (!application) {
            throw new Error(`Cannot create module ${this.constructor} without application instance!`);
        }
        this.application = application;
    }

    async init() {
        throw new Error(`Cannot call abstract method of ${this.constructor} module! Please, override it with own implementation.`);
    }
}

// EXPORTS
module.exports = Module;